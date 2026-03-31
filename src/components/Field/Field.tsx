import type { ComponentProps, ReactNode } from 'react';
import { useId } from 'react';
import cx from 'classnames';

import Label from '@/components/Label';

import styles from './Field.module.css';

type FieldLabelProps = Omit<ComponentProps<typeof Label>, 'children' | 'htmlFor'>;

export type FieldControlProps = {
  fieldId: string;
  describedBy?: string;
  hasError: boolean;
};

export type FieldProps = {
  id?: string;
  label?: ReactNode;
  labelProps?: FieldLabelProps;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  containerClassName?: string;
  'aria-describedby'?: string;
  children: (props: FieldControlProps) => ReactNode;
};

function buildDescribedByIds(ids: Array<string | undefined>, describedBy?: string) {
  return [describedBy, ...ids].filter(Boolean).join(' ') || undefined;
}

export default function Field({
  'aria-describedby': ariaDescribedBy,
  children,
  containerClassName = '',
  error,
  hint,
  id,
  label,
  labelProps,
  required = false
}: FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const hasError = Boolean(error);
  const describedBy = buildDescribedByIds([hintId, errorId], ariaDescribedBy);

  return (
    <div className={cx(styles.Field, containerClassName)}>
      {label ? (
        <Label {...labelProps} htmlFor={fieldId}>
          {label}
          {required ? (
            <span aria-hidden="true" className={styles.requiredMarker}>
              {' '}
              *
            </span>
          ) : null}
        </Label>
      ) : null}

      {children({
        fieldId,
        describedBy,
        hasError
      })}

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
