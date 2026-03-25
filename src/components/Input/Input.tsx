import type { ComponentProps, InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import cx from 'classnames';

import Label from '@/components/Label';

import styles from './Input.module.css';

type InputLabelProps = Omit<ComponentProps<typeof Label>, 'children' | 'htmlFor'>;

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  labelProps?: InputLabelProps;
  hint?: ReactNode;
  error?: ReactNode;
  inputClassName?: string;
  containerClassName?: string;
};

function buildDescribedByIds(ids: Array<string | undefined>, describedBy?: string) {
  return [describedBy, ...ids].filter(Boolean).join(' ') || undefined;
}

export default function Input({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  className = '',
  containerClassName = '',
  error,
  hint,
  id,
  inputClassName = '',
  label,
  labelProps,
  type = 'text',
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = buildDescribedByIds([hintId, errorId], ariaDescribedBy);
  const hasError = Boolean(error);

  return (
    <div className={cx(styles.InputField, containerClassName)}>
      {label ? (
        <Label {...labelProps} htmlFor={inputId}>
          {label}
        </Label>
      ) : null}

      <input
        {...props}
        aria-describedby={describedBy}
        aria-invalid={hasError ? true : ariaInvalid}
        className={cx(styles.Input, { [styles.error]: hasError }, className, inputClassName)}
        id={inputId}
        type={type}
      />

      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}

      {error ? (
        <p className={styles.errorMessage} id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
