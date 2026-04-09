import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ProductsAPI from '@/api/ProductsAPI';
import { ApiError } from '@/api/errors';
import { renderWithQueryClient } from '@/test/renderWithQueryClient';
import TestErrorBoundary from '@/test/TestErrorBoundary';
import type { Product } from '@/types/Products';

import ProductList from './ProductList';

vi.mock('@/api/ProductsAPI', () => ({
  default: {
    listProducts: vi.fn()
  }
}));

const mockedListProducts = vi.mocked(ProductsAPI.listProducts);

const productFixture: Product = {
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

describe('ProductList', () => {
  beforeEach(() => {
    mockedListProducts.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.mocked(console.error).mockRestore();
  });

  it('renders the loading state before the request resolves', () => {
    mockedListProducts.mockReturnValue(new Promise(() => undefined));

    renderWithQueryClient(<ProductList />);

    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('renders products returned by the service', async () => {
    mockedListProducts.mockResolvedValue([productFixture]);

    renderWithQueryClient(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    });

    expect(screen.getByText('PAP-001')).toBeInTheDocument();
    expect(screen.getByText('12,99 €')).toBeInTheDocument();
  });

  it('renders the empty state when no products are returned', async () => {
    mockedListProducts.mockResolvedValue([]);

    renderWithQueryClient(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('No products available yet.')).toBeInTheDocument();
    });
  });

  it('bubbles failed product requests into the nearest error boundary', async () => {
    mockedListProducts.mockRejectedValue(
      new ApiError({
        status: 500,
        code: 'HTTP_500',
        message: 'The server could not process the request.'
      })
    );

    renderWithQueryClient(
      <TestErrorBoundary fallback={<p>Products boundary fallback</p>}>
        <ProductList />
      </TestErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText('Products boundary fallback')).toBeInTheDocument();
    });

    expect(screen.queryByText('The server could not process the request.')).not.toBeInTheDocument();
  });
});
