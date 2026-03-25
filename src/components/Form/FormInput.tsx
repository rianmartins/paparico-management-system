'use client';

import Input from '@/components/Input';
import type { InputProps } from '@/components/Input';
import { useFormContext } from 'react-hook-form';
import type { ChangeHandler, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form';

function callAll(...handlers: Array<((event: any) => void) | ChangeHandler | undefined>) {
  return (event: any) => {
    handlers.forEach((handler) => handler?.(event));
  };
}

export type FormInputProps<TFieldValues extends FieldValues> = Omit<InputProps, 'error' | 'name'> & {
  name: FieldPath<TFieldValues>;
  registerOptions?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
};

export default function FormInput<TFieldValues extends FieldValues>({
  name,
  onBlur,
  onChange,
  registerOptions,
  ...props
}: FormInputProps<TFieldValues>) {
  const { formState, getFieldState, register } = useFormContext<TFieldValues>();
  const { error } = getFieldState(name, formState);
  const { ref, ...registration } = register(name, registerOptions);

  return (
    <Input
      {...props}
      {...registration}
      error={error?.message}
      onBlur={callAll(registration.onBlur, onBlur)}
      onChange={callAll(registration.onChange, onChange)}
      ref={ref}
    />
  );
}
