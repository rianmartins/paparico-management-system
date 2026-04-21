'use client';

import { useEffect, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

import ProductsAPI from '@/api/ProductsAPI';
import { ApiError } from '@/api/errors';
import Button from '@/components/Button';
import Form, { FormErrorSummary, FormInput, FormSelect, applyFormApiErrors, useZodForm } from '@/components/Form';
import Modal from '@/components/Modal';
import useToast from '@/hooks/useToast';
import type {
  CreateProductPayload,
  Product,
  ProductBigInt,
  ProductTaxCode,
  UpdateProductPayload,
  UpsertProductVariantPayload
} from '@/types/Products';

import { productsQueryKey } from '../query';

import { createProductSchema, type CreateProductFormValues } from './schema';
import styles from './ProductsModal.module.css';

export type ProductsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
};

const DEFAULT_CREATE_ERROR_MESSAGE = 'We could not create the product. Try again.';
const DEFAULT_UPDATE_ERROR_MESSAGE = 'We could not update the product. Try again.';
const DEFAULT_DELETE_VARIANT_ERROR_MESSAGE = 'We could not delete the variant. Try again.';

const taxOptions = [
  { value: 'NOR', label: '23% (NOR)' },
  { value: 'INT', label: '13% (INT)' },
  { value: 'RED', label: '6% (RED)' },
  { value: 'ISE', label: '0% (ISE)' }
] satisfies Array<{ value: ProductTaxCode; label: string }>;

function formatCentsToEuroInput(value: number) {
  return (value / 100).toFixed(2).replace('.', ',');
}

function parseEuroPriceToCents(value: string) {
  const [wholeEuros, cents = ''] = value.trim().replace(',', '.').split('.');

  return Number(wholeEuros) * 100 + Number(cents.padEnd(2, '0'));
}

function formatProductIdentifier(value: ProductBigInt | number) {
  return String(value);
}

function parseProductIdentifier(value: ProductBigInt) {
  return Number(value);
}

function getDefaultFormValues(product?: Product | null): CreateProductFormValues {
  if (product) {
    return {
      sku: product.sku ?? '',
      name: product.name,
      base_price_euros: formatCentsToEuroInput(product.base_price_cents),
      tax_code: product.tax_code,
      allow_pickup: product.allow_pickup,
      allow_inhouse: product.allow_inhouse,
      allow_eurosender: product.allow_eurosender,
      product_variants: product.product_variants.map((variant) => ({
        variantId: parseProductIdentifier(variant.id),
        flavor: variant.flavor
      }))
    };
  }

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

function createUpdatePayload(values: CreateProductFormValues): UpdateProductPayload {
  return {
    sku: values.sku,
    name: values.name,
    base_price_cents: parseEuroPriceToCents(values.base_price_euros),
    tax_code: values.tax_code,
    allow_pickup: values.allow_pickup,
    allow_inhouse: values.allow_inhouse,
    allow_eurosender: values.allow_eurosender
  };
}

function createVariantsPayload(values: CreateProductFormValues): UpsertProductVariantPayload[] {
  return values.product_variants.map((variant) => ({
    ...(variant.variantId ? { id: variant.variantId } : {}),
    flavor: variant.flavor
  }));
}

function getProductErrorMessage(error: unknown, defaultMessage: string) {
  if (error instanceof ApiError && error.message.length > 0) {
    return error.message;
  }

  return defaultMessage;
}

export default function ProductsModal({ isOpen, onClose, product = null }: ProductsModalProps) {
  const [deletingVariantIds, setDeletingVariantIds] = useState<Set<string>>(() => new Set());
  const form = useZodForm(createProductSchema, {
    defaultValues: getDefaultFormValues(product)
  });
  const { append, fields, remove } = useFieldArray<CreateProductFormValues, 'product_variants'>({
    control: form.control,
    name: 'product_variants'
  });
  const queryClient = useQueryClient();
  const toast = useToast();
  const isSubmitting = form.formState.isSubmitting;
  const isDeletingVariant = deletingVariantIds.size > 0;
  const isBusy = isSubmitting || isDeletingVariant;
  const { reset } = form;
  const isEditMode = Boolean(product);
  const modalTitle = isEditMode ? 'Edit product' : 'Create product';
  const submitLabel = isEditMode ? 'Update product' : 'Create product';
  const submittingLabel = isEditMode ? 'Updating product...' : 'Creating product...';

  useEffect(() => {
    if (isOpen) {
      reset(getDefaultFormValues(product));
      setDeletingVariantIds(new Set());
    }
  }, [isOpen, product, reset]);

  function closeAndReset() {
    form.reset(getDefaultFormValues(product));
    onClose();
  }

  function handleClose() {
    if (isBusy) {
      return;
    }

    closeAndReset();
  }

  function setVariantDeleting(variantId: ProductBigInt | number, isDeleting: boolean) {
    const formattedVariantId = formatProductIdentifier(variantId);

    setDeletingVariantIds((currentVariantIds) => {
      const nextVariantIds = new Set(currentVariantIds);

      if (isDeleting) {
        nextVariantIds.add(formattedVariantId);
      } else {
        nextVariantIds.delete(formattedVariantId);
      }

      return nextVariantIds;
    });
  }

  async function handleDeleteVariant(index: number, variantId?: number) {
    if (!product || !variantId) {
      remove(index);
      return;
    }

    form.clearErrors('root');
    setVariantDeleting(variantId, true);

    try {
      await ProductsAPI.deleteProductVariant(formatProductIdentifier(product.id), variantId);
      remove(index);
      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
    } catch (error) {
      const description = getProductErrorMessage(error, DEFAULT_DELETE_VARIANT_ERROR_MESSAGE);

      applyFormApiErrors(error, form, {
        defaultMessage: description
      });
      toast.error({
        title: 'Unable to delete variant',
        description
      });
    } finally {
      setVariantDeleting(variantId, false);
    }
  }

  async function handleSubmit(values: CreateProductFormValues) {
    form.clearErrors('root');

    try {
      if (product) {
        const productId = formatProductIdentifier(product.id);
        const variants = createVariantsPayload(values);

        await ProductsAPI.updateProduct(productId, createUpdatePayload(values));

        if (variants.length > 0) {
          await ProductsAPI.saveProductVariants(productId, variants);
        }
      } else {
        await ProductsAPI.createProduct(createPayload(values));
      }

      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
      toast.success({
        title: product ? 'Product updated' : 'Product created',
        description: product ? 'The product has been updated.' : 'The product has been created.'
      });
      closeAndReset();
    } catch (error) {
      const description = getProductErrorMessage(
        error,
        product ? DEFAULT_UPDATE_ERROR_MESSAGE : DEFAULT_CREATE_ERROR_MESSAGE
      );

      applyFormApiErrors(error, form, {
        defaultMessage: description
      });
      toast.error({
        title: product ? 'Unable to update product' : 'Unable to create product',
        description
      });
    }
  }

  return (
    <Modal dialogClassName={styles.dialog} isOpen={isOpen} onClose={handleClose} title={modalTitle}>
      <Form className={styles.form} form={form} onSubmit={handleSubmit}>
        <div className={styles.fields}>
          <FormInput<CreateProductFormValues>
            autoComplete="off"
            disabled={isBusy}
            label="SKU"
            name="sku"
            placeholder="PAP-001"
          />
          <FormInput<CreateProductFormValues>
            autoComplete="off"
            disabled={isBusy}
            label="Name"
            name="name"
            placeholder="Chocolate Cake"
          />
          <FormInput<CreateProductFormValues>
            disabled={isBusy}
            hint="Enter the price in euros. Example: 12,99"
            inputMode="decimal"
            label="Base price"
            name="base_price_euros"
            placeholder="12,99"
          />
          <FormSelect<CreateProductFormValues>
            disabled={isBusy}
            label="Tax rate"
            name="tax_code"
            options={taxOptions}
          />
        </div>

        <fieldset className={styles.fulfillmentGroup} disabled={isBusy}>
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
            <Button disabled={isBusy} onClick={() => append({ flavor: '' })} type="button" variant="secondary">
              Add variant
            </Button>
          </div>

          {fields.length > 0 ? (
            <div className={styles.variantRows}>
              {fields.map((field, index) => (
                <div className={styles.variantRow} key={field.id}>
                  <FormInput<CreateProductFormValues>
                    autoComplete="off"
                    disabled={isBusy}
                    label={`Variant ${index + 1} flavor`}
                    name={`product_variants.${index}.flavor`}
                    placeholder="Vanilla"
                  />
                  <Button
                    aria-label={`Delete variant ${index + 1}`}
                    className={styles.removeVariantButton}
                    disabled={isBusy}
                    onClick={() => void handleDeleteVariant(index, field.variantId)}
                    type="button"
                    variant="secondary"
                  >
                    Delete
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
          <Button disabled={isBusy} onClick={handleClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={isBusy} type="submit">
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
