import { render, screen, waitFor } from '@testing-library/react';
import { observer } from 'mobx-react-lite';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthAPI from '@/api/AuthAPI';
import ProductsAPI from '@/api/ProductsAPI';
import AppProviders from '@/app/providers';
import { clearStoredSession, persistSession } from '@/features/Auth/session';
import productsStore from '@/store/ProductsStore';
import type { AuthUser } from '@/types/Auth';
import type { ListProductsResponse, Product } from '@/types/Products';

import AppWarmup from './AppWarmup';

vi.mock('@/api/ProductsAPI', () => ({
  default: {
    listProducts: vi.fn()
  }
}));

vi.mock('@/api/AuthAPI', () => ({
  default: {
    me: vi.fn()
  }
}));

const mockedListProducts = vi.mocked(ProductsAPI.listProducts);
const mockedMe = vi.mocked(AuthAPI.me);

const authUserFixture: AuthUser = {
  id: '1',
  email: 'manager@paparico.pt',
  roles: ['admin'],
  name: 'Paparico Manager',
  require_password_update: false
};

const productFixture: Product = {
  id: '1',
  sku: 'PAP-001',
  name: 'Chocolate Cake',
  description: 'Rich chocolate sponge cake.',
  base_price_cents: 1299,
  tax_code: 'INT',
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

function listProductsResponseFixture(products: Product[]): ListProductsResponse {
  return {
    data: products,
    meta: {
      offset: 0,
      limit: products.length,
      count: products.length,
      total: products.length,
      has_more: false,
      next_offset: null
    }
  };
}

const ProductNameConsumer = observer(function ProductNameConsumer() {
  const names = productsStore.products.map((p) => p.name).join(', ');
  return <p>{names || 'No products loaded'}</p>;
});

describe('AppWarmup', () => {
  beforeEach(() => {
    productsStore.reset();
    mockedListProducts.mockReset();
    mockedMe.mockReset();
    clearStoredSession();
  });

  it('does not prefetch product data or user when no session exists', () => {
    render(
      <AppProviders>
        <AppWarmup />
      </AppProviders>
    );

    expect(mockedListProducts).not.toHaveBeenCalled();
    expect(mockedMe).not.toHaveBeenCalled();
  });

  it('warms the products store and current user query once after an authenticated session is available', async () => {
    mockedListProducts.mockResolvedValue(listProductsResponseFixture([productFixture]));
    mockedMe.mockResolvedValue(authUserFixture);
    persistSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: false
    });

    render(
      <AppProviders>
        <AppWarmup />
        <ProductNameConsumer />
      </AppProviders>
    );

    await waitFor(() => {
      expect(mockedListProducts).toHaveBeenCalledTimes(1);
      expect(mockedMe).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    });

    // Data is already in the store — consumers don't trigger additional requests
    expect(mockedListProducts).toHaveBeenCalledTimes(1);
    expect(mockedMe).toHaveBeenCalledTimes(1);
  });
});
