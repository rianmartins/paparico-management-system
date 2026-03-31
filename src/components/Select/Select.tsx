import type { ComponentProps, ReactNode, SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import cx from 'classnames';

import Field from '@/components/Field';
import type { FieldProps } from '@/components/Field';
import Label from '@/components/Label';

import styles from './Select.module.css';

type SelectLabelProps = Omit<ComponentProps<typeof Label>, 'children' | 'htmlFor'>;

export type SelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  labelProps?: SelectLabelProps;
  hint?: ReactNode;
  error?: ReactNode;
  options: SelectOption[];
  placeholder?: ReactNode;
  selectClassName?: string;
  containerClassName?: string;
  'aria-describedby'?: FieldProps['aria-describedby'];
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    className = '',
    containerClassName = '',
    error,
    hint,
    id,
    label,
    labelProps,
    options,
    placeholder,
    required,
    selectClassName = '',
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
        <select
          {...props}
          aria-describedby={describedBy}
          aria-invalid={hasError ? true : ariaInvalid}
          className={cx(styles.Select, { [styles.error]: hasError }, className, selectClassName)}
          id={fieldId}
          ref={ref}
          required={required}
        >
          {placeholder ? (
            <option disabled={required} value="">
              {placeholder}
            </option>
          ) : null}

          {options.map((option) => (
            <option disabled={option.disabled} key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
});

export default Select;
