'use client';

import type { ReactNode } from 'react';
import { useEffect, useId, useRef } from 'react';
import cx from 'classnames';

import Button from '@/components/Button';

import styles from './Modal.module.css';

export type ModalProps = {
  title: ReactNode;
  isOpen: boolean;
  children?: ReactNode;
  showCloseButton?: boolean;
  primaryActionLabel?: ReactNode;
  secondaryActionLabel?: ReactNode;
  onClose?: () => void;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  disablePrimaryAction?: boolean;
  disableSecondaryAction?: boolean;
  className?: string;
  dialogClassName?: string;
};

function openDialog(dialog: HTMLDialogElement) {
  if (!dialog.open) {
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
      return;
    }

    dialog.setAttribute('open', '');
  }
}

function closeDialog(dialog: HTMLDialogElement) {
  if (dialog.open) {
    if (typeof dialog.close === 'function') {
      dialog.close();
      return;
    }

    dialog.removeAttribute('open');
  }
}

export default function Modal({
  children,
  className = '',
  dialogClassName = '',
  disablePrimaryAction = false,
  disableSecondaryAction = false,
  isOpen,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel,
  secondaryActionLabel,
  showCloseButton = true,
  title
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const hasFooter = primaryActionLabel || secondaryActionLabel;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (isOpen) {
      openDialog(dialog);
      return;
    }

    closeDialog(dialog);
  }, [isOpen]);

  return (
    <dialog
      aria-labelledby={titleId}
      className={cx(styles.Modal, dialogClassName, className)}
      onCancel={(event) => {
        event.preventDefault();
        onClose?.();
      }}
      ref={dialogRef}
    >
      <div className={styles.content}>
        <header className={styles.header}>
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>

          {showCloseButton ? (
            <button aria-label="Close modal" className={styles.closeButton} onClick={onClose} type="button">
              <span aria-hidden="true">&times;</span>
            </button>
          ) : null}
        </header>

        <div className={styles.body}>{children}</div>

        {hasFooter ? (
          <footer className={styles.footer}>
            {secondaryActionLabel ? (
              <Button disabled={disableSecondaryAction} onClick={onSecondaryAction} variant="secondary">
                {secondaryActionLabel}
              </Button>
            ) : null}

            {primaryActionLabel ? (
              <Button disabled={disablePrimaryAction} onClick={onPrimaryAction}>
                {primaryActionLabel}
              </Button>
            ) : null}
          </footer>
        ) : null}
      </div>
    </dialog>
  );
}
