'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { FieldValues, Resolver, UseFormProps, UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

type SchemaValues<TSchema extends z.ZodType> = z.infer<TSchema> & FieldValues;

export default function useZodForm<TSchema extends z.ZodType>(
  schema: TSchema,
  options?: Omit<UseFormProps<SchemaValues<TSchema>>, 'resolver'>
): UseFormReturn<SchemaValues<TSchema>> {
  return useForm<SchemaValues<TSchema>>({
    ...options,
    resolver: zodResolver(schema as any) as unknown as Resolver<SchemaValues<TSchema>>
  });
}
