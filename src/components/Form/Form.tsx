'use client';

import type { FormHTMLAttributes, ReactNode } from 'react';
import { FormProvider } from 'react-hook-form';
import type { FieldValues, SubmitErrorHandler, SubmitHandler, UseFormReturn } from 'react-hook-form';

export type FormProps<TFieldValues extends FieldValues, TSubmitValues extends FieldValues = TFieldValues> = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'onSubmit'
> & {
  form: UseFormReturn<TFieldValues, unknown, TSubmitValues>;
  children: ReactNode;
  onSubmit: SubmitHandler<TSubmitValues>;
  onInvalid?: SubmitErrorHandler<TFieldValues>;
};

export default function Form<TFieldValues extends FieldValues, TSubmitValues extends FieldValues = TFieldValues>({
  children,
  form,
  noValidate = true,
  onInvalid,
  onSubmit,
  ...props
}: FormProps<TFieldValues, TSubmitValues>) {
  return (
    <FormProvider {...form}>
      <form {...props} noValidate={noValidate} onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        {children}
      </form>
    </FormProvider>
  );
}
