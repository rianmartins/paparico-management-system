'use client';

import { useFieldArray } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

import ProductsAPI from '@/api/ProductsAPI';
import { ApiError } from '@/api/errors';
import Button from '@/components/Button';
import Form, { FormErrorSummary, FormInput, FormSelect, applyFormApiErrors, useZodForm } from '@/components/Form';
import Modal from '@/components/Modal';
import useToast from '@/hooks/useToast';
import type { CreateProductPayload, ProductTaxCode } from '@/types/Products';

import { productsQueryKey } from '../query';

import { createProductSchema, type CreateProductFormValues } from './schema';
import styles from './ProductsModal.module.css';

export type ProductsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DEFAULT_ERROR_MESSAGE = 'We could not create the product. Try again.';

const taxOptions = [
  { value: 'NOR', label: '23% (NOR)' },
  { value: 'INT', label: '13% (INT)' },
  { value: 'RED', label: '6% (RED)' },
  { value: 'ISE', label: '0% (ISE)' }
] satisfies Array<{ value: ProductTaxCode; label: string }>;

function getDefaultFormValues(): CreateProductFormValues {
  return {
    sku: '',
    name: '',
    base_price_euros: '',
    tax_code: 'NOR',
    allow_pickup: true,
    allow_inhouse: true,
    allow_eurosender: false,
    product_variants: []
  };
}

function parseEuroPriceToCents(value: string) {
  const [wholeEuros, cents = ''] = value.trim().replace(',', '.').split('.');

  return Number(wholeEuros) * 100 + Number(cents.padEnd(2, '0'));
}

function createPayload(values: CreateProductFormValues): CreateProductPayload {
  const variants = values.product_variants.map((variant) => ({
    flavor: variant.flavor
  }));
  const payload: CreateProductPayload = {
    sku: values.sku,
    name: values.name,
    base_price_cents: parseEuroPriceToCents(values.base_price_euros),
    tax_code: values.tax_code,
    allow_pickup: values.allow_pickup,
    allow_inhouse: values.allow_inhouse,
    allow_eurosender: values.allow_eurosender
  };

  if (variants.length > 0) {
    payload.product_variants = variants;
  }

  return payload;
}

function getCreateProductErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.message.length > 0) {
    return error.message;
  }

  return DEFAULT_ERROR_MESSAGE;
}

export default function ProductsModal({ isOpen, onClose }: ProductsModalProps) {
  const form = useZodForm(createProductSchema, {
    defaultValues: getDefaultFormValues()
  });
  const { append, fields, remove } = useFieldArray<CreateProductFormValues, 'product_variants'>({
    control: form.control,
    name: 'product_variants'
  });
  const queryClient = useQueryClient();
  const toast = useToast();
  const isSubmitting = form.formState.isSubmitting;

  function closeAndReset() {
    form.reset(getDefaultFormValues());
    onClose();
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    closeAndReset();
  }

  async function handleSubmit(values: CreateProductFormValues) {
    form.clearErrors('root');

    try {
      await ProductsAPI.createProduct(createPayload(values));
      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
      toast.success({
        title: 'Product created',
        description: 'The product has been created.'
      });
      closeAndReset();
    } catch (error) {
      const description = getCreateProductErrorMessage(error);

      applyFormApiErrors(error, form, {
        defaultMessage: description
      });
      toast.error({
        title: 'Unable to create product',
        description
      });
    }
  }

  return (
    <Modal dialogClassName={styles.dialog} isOpen={isOpen} onClose={handleClose} title="Create product">
      <Form className={styles.form} form={form} onSubmit={handleSubmit}>
        <div className={styles.fields}>
          <FormInput<CreateProductFormValues>
            autoComplete="off"
            disabled={isSubmitting}
            label="SKU"
            name="sku"
            placeholder="PAP-001"
          />
          <FormInput<CreateProductFormValues>
            autoComplete="off"
            disabled={isSubmitting}
            label="Name"
            name="name"
            placeholder="Chocolate Cake"
          />
          <FormInput<CreateProductFormValues>
            disabled={isSubmitting}
            hint="Enter the price in euros. Example: 12,99"
            inputMode="decimal"
            label="Base price"
            name="base_price_euros"
            placeholder="12,99"
          />
          <FormSelect<CreateProductFormValues>
            disabled={isSubmitting}
            label="Tax rate"
            name="tax_code"
            options={taxOptions}
          />
        </div>

        <fieldset className={styles.fulfillmentGroup} disabled={isSubmitting}>
          <legend>Fulfillment</legend>
          <label className={styles.checkbox}>
            <input type="checkbox" {...form.register('allow_pickup')} />
            <span>Pickup</span>
          </label>
          <label className={styles.checkbox}>
            <input type="checkbox" {...form.register('allow_inhouse')} />
            <span>In-house</span>
          </label>
          <label className={styles.checkbox}>
            <input type="checkbox" {...form.register('allow_eurosender')} />
            <span>Eurosender</span>
          </label>
        </fieldset>

        <section aria-labelledby="product-variants-title" className={styles.variantsSection}>
          <div className={styles.variantsHeader}>
            <div>
              <h3 id="product-variants-title">Variants</h3>
              <p>Use one row for each flavor.</p>
            </div>
            <Button disabled={isSubmitting} onClick={() => append({ flavor: '' })} type="button" variant="secondary">
              Add variant
            </Button>
          </div>

          {fields.length > 0 ? (
            <div className={styles.variantRows}>
              {fields.map((field, index) => (
                <div className={styles.variantRow} key={field.id}>
                  <FormInput<CreateProductFormValues>
                    autoComplete="off"
                    disabled={isSubmitting}
                    label={`Variant ${index + 1} flavor`}
                    name={`product_variants.${index}.flavor`}
                    placeholder="Vanilla"
                  />
                  <Button
                    aria-label={`Remove variant ${index + 1}`}
                    className={styles.removeVariantButton}
                    disabled={isSubmitting}
                    onClick={() => remove(index)}
                    type="button"
                    variant="secondary"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyVariants}>No variants added.</p>
          )}
        </section>

        <FormErrorSummary form={form} />

        <div className={styles.actions}>
          <Button disabled={isSubmitting} onClick={handleClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating product...' : 'Create product'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
