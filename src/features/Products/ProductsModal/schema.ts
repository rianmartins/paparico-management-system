import { z } from 'zod';

export const productTaxCodes = ['NOR', 'INT', 'RED', 'ISE'] as const;

const euroPricePattern = /^\d+(?:[.,]\d{1,2})?$/;

export const createProductSchema = z.object({
  sku: z.string().trim().min(1, 'SKU is required.').max(64, 'SKU must be 64 characters or fewer.'),
  name: z.string().trim().min(1, 'Name is required.').max(255, 'Name must be 255 characters or fewer.'),
  base_price_euros: z
    .string()
    .trim()
    .min(1, 'Base price is required.')
    .refine((value) => euroPricePattern.test(value), 'Enter a non-negative price with up to 2 decimals.'),
  tax_code: z.enum(productTaxCodes, {
    message: 'Tax rate is required.'
  }),
  allow_pickup: z.boolean(),
  allow_inhouse: z.boolean(),
  allow_eurosender: z.boolean(),
  product_variants: z.array(
    z.object({
      flavor: z
        .string()
        .trim()
        .min(1, 'Variant flavor is required.')
        .max(128, 'Variant flavor must be 128 characters or fewer.')
    })
  )
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;
