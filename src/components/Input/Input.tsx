import type { ComponentProps, InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import cx from 'classnames';

import Field from '@/components/Field';
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

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
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
    required,
    type = 'text',
    ...props
  },
  ref
) {
  return (
    <Field
      aria-describedby={ariaDescribedBy}
      containerClassName={containerClassName}
      error={error}
      hint={hint}
      id={id}
      label={label}
      labelProps={labelProps}
      required={required}
    >
      {({ describedBy, fieldId, hasError }) => (
        <input
          {...props}
          aria-describedby={describedBy}
          aria-invalid={hasError ? true : ariaInvalid}
          className={cx(styles.Input, { [styles.error]: hasError }, className, inputClassName)}
          id={fieldId}
          ref={ref}
          required={required}
          type={type}
        />
      )}
    </Field>
  );
});

export default Input;
