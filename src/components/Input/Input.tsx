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
  leftIcon?: ReactNode;
  onSubmit?: () => void;
  variant?: 'primary' | 'secondary';
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
    leftIcon,
    required,
    type = 'text',
    onSubmit,
    variant = 'primary',
    ...props
  },
  ref
) {
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSubmit?.();
    }
  };

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
      {({ describedBy, fieldId, hasError }) => {
        const input = (
          <input
            {...props}
            aria-describedby={describedBy}
            aria-invalid={hasError ? true : ariaInvalid}
            className={cx(
              styles.Input,
              { [styles.hasIcon]: leftIcon, [styles.error]: hasError },
              styles[variant],
              className,
              inputClassName
            )}
            id={fieldId}
            onKeyDown={onKeyDown}
            ref={ref}
            required={required}
            type={type}
          />
        );

        return leftIcon ? (
          <div className={styles.inputWrapper}>
            <span className={styles.icon}>{leftIcon}</span>
            {input}
          </div>
        ) : (
          input
        );
      }}
    </Field>
  );
});

export default Input;
