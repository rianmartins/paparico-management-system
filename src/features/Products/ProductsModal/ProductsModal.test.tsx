import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ProductsAPI from '@/api/ProductsAPI';
import { ApiError } from '@/api/errors';
import ToastProvider from '@/components/Toast/ToastProvider';
import { productsQueryKey } from '@/features/Products/query';
import { createTestQueryClient } from '@/test/createTestQueryClient';
import type { Product } from '@/types/Products';

import ProductsModal from './ProductsModal';

vi.mock('@/api/ProductsAPI', () => ({
  default: {
    createProduct: vi.fn()
  }
}));

const mockedCreateProduct = vi.mocked(ProductsAPI.createProduct);

const createdProductFixture: Product = {
  id: '3',
  sku: 'PAP-003',
  name: 'Vanilla Cake',
  description: null,
  base_price_cents: 1299,
  tax_id: '1',
  weight_grams: null,
  length_cm: null,
  width_cm: null,
  height_cm: null,
  is_active: true,
  allow_pickup: true,
  allow_inhouse: true,
  allow_eurosender: false,
  max_inhouse_distance_km: null,
  notes_shipping: null,
  external_toconline_product_id: null,
  external_toconline_item_code: null,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  product_variants: []
};

function TestProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createTestQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}

function renderProductsModal(ui: ReactElement) {
  const queryClient = createTestQueryClient();
  const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

  return {
    invalidateQueriesSpy,
    ...render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{ui}</ToastProvider>
      </QueryClientProvider>
    )
  };
}

function fillRequiredProductFields({
  basePrice = '12,99',
  name = ' Vanilla Cake ',
  sku = ' PAP-003 ',
  taxCode = 'INT'
}: {
  basePrice?: string;
  name?: string;
  sku?: string;
  taxCode?: string;
} = {}) {
  fireEvent.change(screen.getByLabelText('SKU'), {
    target: {
      value: sku
    }
  });
  fireEvent.change(screen.getByLabelText('Name'), {
    target: {
      value: name
    }
  });
  fireEvent.change(screen.getByLabelText('Base price'), {
    target: {
      value: basePrice
    }
  });
  fireEvent.change(screen.getByLabelText('Tax rate'), {
    target: {
      value: taxCode
    }
  });
}

describe('ProductsModal', () => {
  const originalShowModal = HTMLDialogElement.prototype.showModal;
  const originalClose = HTMLDialogElement.prototype.close;

  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });

    HTMLDialogElement.prototype.close = vi.fn(function close(this: HTMLDialogElement) {
      this.removeAttribute('open');
    });

    mockedCreateProduct.mockReset();
  });

  afterEach(() => {
    HTMLDialogElement.prototype.showModal = originalShowModal;
    HTMLDialogElement.prototype.close = originalClose;
  });

  it('renders the required fields and static tax options', () => {
    renderProductsModal(<ProductsModal isOpen onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Create product' })).toHaveAttribute('open');
    expect(screen.getByLabelText('SKU')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Base price')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Tax rate' })).toHaveValue('NOR');
    expect(screen.getByRole('option', { name: '23% (NOR)' })).toHaveValue('NOR');
    expect(screen.getByRole('option', { name: '13% (INT)' })).toHaveValue('INT');
    expect(screen.getByRole('option', { name: '6% (RED)' })).toHaveValue('RED');
    expect(screen.getByRole('option', { name: '0% (ISE)' })).toHaveValue('ISE');
    expect(screen.getByLabelText('Pickup')).toBeChecked();
    expect(screen.getByLabelText('In-house')).toBeChecked();
    expect(screen.getByLabelText('Eurosender')).not.toBeChecked();
    expect(screen.getByText('No variants added.')).toBeInTheDocument();
  });

  it('validates required fields before submitting', async () => {
    renderProductsModal(<ProductsModal isOpen onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Create product' }));

    expect(await screen.findByText('SKU is required.')).toBeInTheDocument();
    expect(screen.getByText('Name is required.')).toBeInTheDocument();
    expect(screen.getByText('Base price is required.')).toBeInTheDocument();
    expect(mockedCreateProduct).not.toHaveBeenCalled();
  });

  it('creates a product with cents converted from the euro price and omits empty variants', async () => {
    mockedCreateProduct.mockResolvedValue(createdProductFixture);
    renderProductsModal(<ProductsModal isOpen onClose={vi.fn()} />);

    fillRequiredProductFields();
    fireEvent.click(screen.getByLabelText('Eurosender'));
    fireEvent.click(screen.getByRole('button', { name: 'Create product' }));

    await waitFor(() => {
      expect(mockedCreateProduct).toHaveBeenCalledWith({
        sku: 'PAP-003',
        name: 'Vanilla Cake',
        base_price_cents: 1299,
        tax_code: 'INT',
        allow_pickup: true,
        allow_inhouse: true,
        allow_eurosender: true
      });
    });
  });

  it('adds and removes optional variant rows before submitting', async () => {
    mockedCreateProduct.mockResolvedValue(createdProductFixture);
    renderProductsModal(<ProductsModal isOpen onClose={vi.fn()} />);

    fillRequiredProductFields();
    fireEvent.click(screen.getByRole('button', { name: 'Add variant' }));
    fireEvent.change(screen.getByLabelText('Variant 1 flavor'), {
      target: {
        value: 'Vanilla'
      }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add variant' }));
    fireEvent.change(screen.getByLabelText('Variant 2 flavor'), {
      target: {
        value: ' Chocolate '
      }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Remove variant 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create product' }));

    await waitFor(() => {
      expect(mockedCreateProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          product_variants: [
            {
              flavor: 'Chocolate'
            }
          ]
        })
      );
    });
  });

  it('validates variant flavors when variant rows exist', async () => {
    renderProductsModal(<ProductsModal isOpen onClose={vi.fn()} />);

    fillRequiredProductFields();
    fireEvent.click(screen.getByRole('button', { name: 'Add variant' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create product' }));

    expect(await screen.findByText('Variant flavor is required.')).toBeInTheDocument();
    expect(mockedCreateProduct).not.toHaveBeenCalled();
  });

  it('shows API errors and keeps the modal open when creation fails', async () => {
    mockedCreateProduct.mockRejectedValue(
      new ApiError({
        status: 500,
        code: 'HTTP_500',
        message: 'The server could not create this product.'
      })
    );
    renderProductsModal(<ProductsModal isOpen onClose={vi.fn()} />);

    fillRequiredProductFields();
    fireEvent.click(screen.getByRole('button', { name: 'Create product' }));

    expect(await screen.findByText('Unable to create product')).toBeInTheDocument();
    expect(screen.getAllByText('The server could not create this product.').length).toBeGreaterThan(0);
    expect(screen.getByRole('dialog', { name: 'Create product' })).toHaveAttribute('open');
  });

  it('resets, closes, and invalidates product queries after a successful creation', async () => {
    mockedCreateProduct.mockResolvedValue(createdProductFixture);

    function ControlledProductsModal() {
      const [isOpen, setIsOpen] = useState(true);

      return (
        <>
          <button onClick={() => setIsOpen(true)} type="button">
            Open product modal
          </button>
          <ProductsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
      );
    }

    const { container, invalidateQueriesSpy } = renderProductsModal(<ControlledProductsModal />);

    fillRequiredProductFields();
    fireEvent.click(screen.getByRole('button', { name: 'Create product' }));

    expect(await screen.findByText('The product has been created.')).toBeInTheDocument();

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: productsQueryKey });
      expect(container.querySelector('dialog')).not.toHaveAttribute('open');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Open product modal' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Create product' })).toHaveAttribute('open');
    });
    expect(screen.getByLabelText('SKU')).toHaveValue('');
  });
});

describe('ProductsModal providers', () => {
  it('can render with the app-level provider shape', () => {
    render(
      <TestProviders>
        <ProductsModal isOpen={false} onClose={vi.fn()} />
      </TestProviders>
    );

    expect(screen.queryByRole('dialog', { name: 'Create product' })).not.toBeInTheDocument();
  });
});
