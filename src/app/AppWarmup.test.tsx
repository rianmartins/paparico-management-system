import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthAPI from '@/api/AuthAPI';
import ProductsAPI from '@/api/ProductsAPI';
import AppProviders from '@/app/providers';
import { clearStoredSession, persistSession } from '@/features/Auth/session';
import { useProductsValue } from '@/features/Products';
import type { AuthUser } from '@/types/Auth';
import type { Product } from '@/types/Products';

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

function ProductNameConsumer() {
  const { data } = useProductsValue((products) => products.map((product) => product.name).join(', '));

  return <p>{data ?? 'Loading products...'}</p>;
}

function DelayedProductConsumer() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <button onClick={() => setIsVisible(true)} type="button">
        Show products
      </button>
      {isVisible ? <ProductNameConsumer /> : null}
    </>
  );
}

describe('AppWarmup', () => {
  beforeEach(() => {
    mockedListProducts.mockReset();
    mockedMe.mockReset();
    clearStoredSession();
  });

  it('does not prefetch protected product data before a consumer asks for it', async () => {
    mockedListProducts.mockResolvedValue([productFixture]);

    render(
      <AppProviders>
        <AppWarmup />
        <DelayedProductConsumer />
      </AppProviders>
    );

    expect(mockedListProducts).not.toHaveBeenCalled();
    expect(mockedMe).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Show products' }));

    await waitFor(() => {
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    });

    expect(mockedListProducts).toHaveBeenCalledTimes(1);
    expect(mockedMe).not.toHaveBeenCalled();
  });

  it('warms the products and current user queries once after an authenticated session is available', async () => {
    mockedListProducts.mockResolvedValue([productFixture]);
    mockedMe.mockResolvedValue(authUserFixture);
    persistSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: false
    });

    render(
      <AppProviders>
        <AppWarmup />
        <DelayedProductConsumer />
      </AppProviders>
    );

    await waitFor(() => {
      expect(mockedListProducts).toHaveBeenCalledTimes(1);
      expect(mockedMe).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Show products' }));

    await waitFor(() => {
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    });

    expect(mockedListProducts).toHaveBeenCalledTimes(1);
    expect(mockedMe).toHaveBeenCalledTimes(1);
  });
});
