'use client';

import cx from 'classnames';
import type { FieldValues, GlobalError, UseFormReturn } from 'react-hook-form';

import styles from './Form.module.css';

function hasMessage(value: unknown): value is { message?: string } {
  return typeof value === 'object' && value !== null && 'message' in value;
}

function getRootErrorMessage(rootError?: Record<string, GlobalError> & GlobalError) {
  if (!rootError) {
    return undefined;
  }

  if (typeof rootError.message === 'string' && rootError.message.length > 0) {
    return rootError.message;
  }

  for (const value of Object.values(rootError)) {
    if (hasMessage(value) && typeof value.message === 'string' && value.message.length > 0) {
      return value.message;
    }
  }

  return undefined;
}

export type FormErrorSummaryProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  className?: string;
};

export default function FormErrorSummary<TFieldValues extends FieldValues>({
  className = '',
  form
}: FormErrorSummaryProps<TFieldValues>) {
  const message = getRootErrorMessage(form.formState.errors.root);

  if (!message) {
    return null;
  }

  return (
    <p aria-live="polite" className={cx(styles.errorSummary, className)} role="alert">
      {message}
    </p>
  );
}
