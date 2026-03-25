'use client';

import type { ChangeEventHandler, FocusEventHandler } from 'react';

import Select from '@/components/Select';
import type { SelectProps } from '@/components/Select';
import { useFormContext } from 'react-hook-form';
import type { ChangeHandler, FieldPath, FieldValues, RegisterOptions } from 'react-hook-form';

type RegisteredSelectEvent = Parameters<ChangeHandler>[0];

function createSelectBlurHandler(
  registrationHandler: ChangeHandler,
  selectHandler?: FocusEventHandler<HTMLSelectElement>
): FocusEventHandler<HTMLSelectElement> {
  return (event) => {
    registrationHandler(event as unknown as RegisteredSelectEvent);
    selectHandler?.(event);
  };
}

function createSelectChangeHandler(
  registrationHandler: ChangeHandler,
  selectHandler?: ChangeEventHandler<HTMLSelectElement>
): ChangeEventHandler<HTMLSelectElement> {
  return (event) => {
    registrationHandler(event as unknown as RegisteredSelectEvent);
    selectHandler?.(event);
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
      onBlur={createSelectBlurHandler(registration.onBlur, onBlur)}
      onChange={createSelectChangeHandler(registration.onChange, onChange)}
      ref={ref}
    />
  );
}
