import type { ReactNode } from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export type ToastPayload = {
  title?: ReactNode;
  description: ReactNode;
  duration?: number;
  dismissible?: boolean;
};

export type ToastItem = ToastPayload & {
  id: string;
  variant: ToastVariant;
};

export type ToastProps = ToastItem & {
  onClose?: () => void;
};

export type ToastContextValue = {
  dismissToast: (id: string) => void;
  showToast: (variant: ToastVariant, payload: ToastPayload) => string;
  success: (payload: ToastPayload) => string;
  error: (payload: ToastPayload) => string;
  info: (payload: ToastPayload) => string;
  warning: (payload: ToastPayload) => string;
};
