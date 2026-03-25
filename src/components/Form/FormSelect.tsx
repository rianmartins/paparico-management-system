'use client';

import Select from '@/components/Select';
import type { SelectProps } from '@/components/Select';
import { useFormContext } from 'react-hook-form';
import type { ChangeHandler, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form';

function callAll(...handlers: Array<((event: any) => void) | ChangeHandler | undefined>) {
  return (event: any) => {
    handlers.forEach((handler) => handler?.(event));
  };
}

export type FormSelectProps<TFieldValues extends FieldValues> = Omit<SelectProps, 'error' | 'name'> & {
  name: FieldPath<TFieldValues>;
  registerOptions?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
};

export default function FormSelect<TFieldValues extends FieldValues>({
  name,
  onBlur,
  onChange,
  registerOptions,
  ...props
}: FormSelectProps<TFieldValues>) {
  const { formState, getFieldState, register } = useFormContext<TFieldValues>();
  const { error } = getFieldState(name, formState);
  const { ref, ...registration } = register(name, registerOptions);

  return (
    <Select
      {...props}
      {...registration}
      error={error?.message}
      onBlur={callAll(registration.onBlur, onBlur)}
      onChange={callAll(registration.onChange, onChange)}
      ref={ref}
    />
  );
}
