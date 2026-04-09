import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProductsAPI from '@/api/ProductsAPI';
import { ApiError } from '@/api/errors';
import { selectActiveProducts, selectProductOptions, selectProductsTableRows } from '@/services/ProductsService';
import { createTestQueryClient } from '@/test/createTestQueryClient';
import { renderWithQueryClient } from '@/test/renderWithQueryClient';
import TestErrorBoundary from '@/test/TestErrorBoundary';
import type { Product } from '@/types/Products';

import { productsQueryKey, useProductsValue } from './query';

vi.mock('@/api/ProductsAPI', () => ({
  default: {
    listProducts: vi.fn()
  }
}));

const mockedListProducts = vi.mocked(ProductsAPI.listProducts);

const activeProductFixture: Product = {
  id: '1',
  sku: 'PAP-001',
  name: 'Chocolate Cake',
  description: 'Rich chocolate sponge cake.',
  base_price_cents: 1299,
  tax_id: '2',
  weight_grams: 500,
  length_cm: 20,
  width_cm: 20,
  height_cm: 8,
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

const inactiveProductFixture: Product = {
  ...activeProductFixture,
  id: '2',
  sku: 'PAP-002',
  name: 'Seasonal Tart',
  base_price_cents: 1599,
  is_active: false,
  allow_pickup: false,
  allow_inhouse: false
};

function ActiveProductsConsumer() {
  const { data } = useProductsValue(selectActiveProducts);

  return <p>{data?.map((product) => product.name).join(', ') ?? 'Loading active products...'}</p>;
}

function ProductOptionsConsumer() {
  const { data } = useProductsValue(selectProductOptions);

  return (
    <p>
      {data?.map((option) => `${option.label}:${option.disabled ? 'disabled' : 'enabled'}`).join(', ') ??
        'Loading options...'}
    </p>
  );
}

function ProductTableRowsConsumer() {
  const { data } = useProductsValue(selectProductsTableRows);

  return <p>{data?.map((row) => `${row.name}:${row.price}`).join(', ') ?? 'Loading rows...'}</p>;
}

function ProductsInvalidationConsumer() {
  const queryClient = useQueryClient();
  const { data } = useProductsValue((products) => products.map((product) => product.name).join(', '));

  return (
    <>
      <p>{data ?? 'Loading products...'}</p>
      <button
        onClick={() => {
          void queryClient.invalidateQueries({ queryKey: productsQueryKey });
        }}
        type="button"
      >
        Refresh products
      </button>
    </>
  );
}

describe('products query', () => {
  beforeEach(() => {
    mockedListProducts.mockReset();
  });

  it('shares one cached fetch across consumers with different selectors', async () => {
    mockedListProducts.mockResolvedValue([activeProductFixture, inactiveProductFixture]);

    renderWithQueryClient(
      <>
        <ActiveProductsConsumer />
        <ProductOptionsConsumer />
        <ProductTableRowsConsumer />
      </>
    );

    await waitFor(() => {
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    });

    expect(screen.getByText('Chocolate Cake:enabled, Seasonal Tart:disabled')).toBeInTheDocument();
    expect(screen.getByText('Chocolate Cake:12,99 €, Seasonal Tart:15,99 €')).toBeInTheDocument();
    expect(mockedListProducts).toHaveBeenCalledTimes(1);
  });

  it('keeps products available across remounts within the same query client', async () => {
    mockedListProducts.mockResolvedValue([activeProductFixture]);

    const queryClient = createTestQueryClient();
    function Wrapper({ children }: PropsWithChildren) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    const firstRender = render(<ActiveProductsConsumer />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    });

    expect(mockedListProducts).toHaveBeenCalledTimes(1);

    firstRender.unmount();

    render(<ActiveProductsConsumer />, { wrapper: Wrapper });

    expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    expect(mockedListProducts).toHaveBeenCalledTimes(1);
  });

  it('refetches products after explicit invalidation', async () => {
    mockedListProducts.mockResolvedValueOnce([activeProductFixture]).mockResolvedValueOnce([inactiveProductFixture]);

    renderWithQueryClient(<ProductsInvalidationConsumer />);

    await waitFor(() => {
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Refresh products' }));

    await waitFor(() => {
      expect(screen.getByText('Seasonal Tart')).toBeInTheDocument();
    });

    expect(mockedListProducts).toHaveBeenCalledTimes(2);
  });

  it('throws failed selector queries into the nearest error boundary', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    mockedListProducts.mockRejectedValue(
      new ApiError({
        status: 0,
        code: 'HTTP_0',
        message: 'The backend is unreachable.'
      })
    );

    renderWithQueryClient(
      <TestErrorBoundary fallback={<p>Products query boundary fallback</p>}>
        <ActiveProductsConsumer />
      </TestErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText('Products query boundary fallback')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });
});
