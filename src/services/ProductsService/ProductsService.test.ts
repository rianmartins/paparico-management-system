import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProductsAPI from '@/api/ProductsAPI';
import ProductsService, {
  selectActiveProducts,
  selectProductOptions,
  selectProductsTableRows
} from '@/services/ProductsService';
import type { Product } from '@/types/Products';

vi.mock('@/api/ProductsAPI', () => ({
  default: {
    listProducts: vi.fn()
  }
}));

const mockedListProducts = vi.mocked(ProductsAPI.listProducts);
const currencyFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR'
});

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

describe('ProductsService', () => {
  beforeEach(() => {
    mockedListProducts.mockReset();
  });

  it('loads products through the API layer', async () => {
    mockedListProducts.mockResolvedValue([activeProductFixture]);

    await expect(ProductsService.loadProducts()).resolves.toEqual([activeProductFixture]);
    expect(mockedListProducts).toHaveBeenCalledTimes(1);
  });

  it('selects only active products', () => {
    expect(selectActiveProducts([activeProductFixture, inactiveProductFixture])).toEqual([activeProductFixture]);
  });

  it('maps products into select options', () => {
    expect(selectProductOptions([activeProductFixture, inactiveProductFixture])).toEqual([
      {
        value: '1',
        label: 'Chocolate Cake',
        disabled: false
      },
      {
        value: '2',
        label: 'Seasonal Tart',
        disabled: true
      }
    ]);
  });

  it('maps products into reusable table rows', () => {
    expect(selectProductsTableRows([activeProductFixture])).toEqual([
      {
        id: '1',
        sku: 'PAP-001',
        name: 'Chocolate Cake',
        description: 'Rich chocolate sponge cake.',
        price: currencyFormatter.format(1299 / 100),
        status: 'Active',
        variantsCount: 0,
        allowPickup: 'Yes',
        allowInhouse: 'Yes'
      }
    ]);
  });
});
