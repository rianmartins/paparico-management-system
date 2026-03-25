'use client';

import type { ChangeEventHandler, FocusEventHandler } from 'react';

import Input from '@/components/Input';
import type { InputProps } from '@/components/Input';
import { useFormContext } from 'react-hook-form';
import type { ChangeHandler, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form';

type RegisteredInputEvent = Parameters<ChangeHandler>[0];

function createInputBlurHandler(
  registrationHandler: ChangeHandler,
  inputHandler?: FocusEventHandler<HTMLInputElement>
): FocusEventHandler<HTMLInputElement> {
  return (event) => {
    registrationHandler(event as unknown as RegisteredInputEvent);
    inputHandler?.(event);
  };
}

function createInputChangeHandler(
  registrationHandler: ChangeHandler,
  inputHandler?: ChangeEventHandler<HTMLInputElement>
): ChangeEventHandler<HTMLInputElement> {
  return (event) => {
    registrationHandler(event as unknown as RegisteredInputEvent);
    inputHandler?.(event);
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
      onBlur={createInputBlurHandler(registration.onBlur, onBlur)}
      onChange={createInputChangeHandler(registration.onChange, onChange)}
      ref={ref}
    />
  );
}
