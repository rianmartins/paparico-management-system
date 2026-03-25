'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Toast from './Toast';
import styles from './Toast.module.css';
import type { ToastContextValue, ToastItem, ToastPayload, ToastVariant } from './types';

const DEFAULT_DURATION = 4000;

export const ToastContext = createContext<ToastContextValue | null>(null);

export type ToastProviderProps = {
  children: ReactNode;
};

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    const timeout = timeoutRefs.current.get(id);

    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (variant: ToastVariant, payload: ToastPayload) => {
      toastIdRef.current += 1;
      const randomId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : String(toastIdRef.current);
      const id = `toast-${randomId}`;
      const nextToast: ToastItem = {
        id,
        variant,
        dismissible: payload.dismissible ?? true,
        duration: payload.duration ?? DEFAULT_DURATION,
        title: payload.title,
        description: payload.description
      };

      setToasts((currentToasts) => [...currentToasts, nextToast]);

      if (nextToast.duration && nextToast.duration > 0) {
        const timeout = setTimeout(() => {
          dismissToast(id);
        }, nextToast.duration);

        timeoutRefs.current.set(id, timeout);
      }

      return id;
    },
    [dismissToast]
  );

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      dismissToast,
      showToast,
      success: (payload) => showToast('success', payload),
      error: (payload) => showToast('error', payload),
      info: (payload) => showToast('info', payload),
      warning: (payload) => showToast('warning', payload)
    }),
    [dismissToast, showToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <div aria-label="Notifications" className={styles.ToastViewport}>
        {toasts.map((toast) => (
          <Toast
            description={toast.description}
            dismissible={toast.dismissible}
            id={toast.id}
            key={toast.id}
            onClose={() => dismissToast(toast.id)}
            title={toast.title}
            variant={toast.variant}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
