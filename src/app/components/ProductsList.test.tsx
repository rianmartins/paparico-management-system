import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/errors';
import ProductsList from '@/app/components/ProductsList';
import ProductsService from '@/service/ProductsService';
import type { Product } from '@/types/Products';

vi.mock('@/service/ProductsService', () => ({
  default: {
    listProducts: vi.fn()
  }
}));

const mockedListProducts = vi.mocked(ProductsService.listProducts);

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

describe('ProductsList', () => {
  beforeEach(() => {
    mockedListProducts.mockReset();
  });

  it('renders the loading state before the request resolves', () => {
    mockedListProducts.mockReturnValue(new Promise(() => undefined));

    render(<ProductsList />);

    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('renders products returned by the service', async () => {
    mockedListProducts.mockResolvedValue([productFixture]);

    render(<ProductsList />);

    await waitFor(() => {
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    });

    expect(screen.getByText('PAP-001')).toBeInTheDocument();
    expect(screen.getByText('12,99 €')).toBeInTheDocument();
  });

  it('renders the empty state when no products are returned', async () => {
    mockedListProducts.mockResolvedValue([]);

    render(<ProductsList />);

    await waitFor(() => {
      expect(screen.getByText('No products available yet.')).toBeInTheDocument();
    });
  });

  it('renders the normalized ApiError message', async () => {
    mockedListProducts.mockRejectedValue(
      new ApiError({
        status: 500,
        code: 'HTTP_500',
        message: 'The server could not process the request.'
      })
    );

    render(<ProductsList />);

    await waitFor(() => {
      expect(screen.getByText('The server could not process the request.')).toBeInTheDocument();
    });
  });
});
