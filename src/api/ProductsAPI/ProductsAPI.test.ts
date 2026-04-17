import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProductsAPI from '@/api/ProductsAPI';
import { getAxiosClient } from '@/api/axiosClient';
import type { CreateProductPayload, ListProductsResponse, Product } from '@/types/Products';

vi.mock('@/api/axiosClient', () => ({
  getAxiosClient: vi.fn()
}));

const getMock = vi.fn();
const postMock = vi.fn();
const mockedGetAxiosClient = vi.mocked(getAxiosClient);

describe('ProductsAPI', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    mockedGetAxiosClient.mockReset();
    mockedGetAxiosClient.mockReturnValue({
      get: getMock,
      post: postMock
    } as unknown as ReturnType<typeof getAxiosClient>);
  });

  it('reads products directly from the backend products endpoint', async () => {
    const response: ListProductsResponse = {
      data: [],
      meta: {
        offset: 0,
        limit: 25,
        count: 0,
        total: 0,
        has_more: false,
        next_offset: null
      }
    };

    getMock.mockResolvedValue({
      data: response
    });

    await expect(ProductsAPI.listProducts()).resolves.toEqual(response);

    expect(getMock).toHaveBeenCalledWith('/products');
  });

  it('passes the product search query to the backend products endpoint', async () => {
    const response: ListProductsResponse = {
      data: [],
      meta: {
        offset: 0,
        limit: 25,
        count: 0,
        total: 0,
        has_more: false,
        next_offset: null
      }
    };

    getMock.mockResolvedValue({
      data: response
    });

    await expect(ProductsAPI.listProducts({ q: 'Chocolate' })).resolves.toEqual(response);

    expect(getMock).toHaveBeenCalledWith('/products', {
      params: {
        q: 'Chocolate'
      }
    });
  });

  it('passes pagination params to the backend products endpoint', async () => {
    const response: ListProductsResponse = {
      data: [],
      meta: {
        offset: 25,
        limit: 25,
        count: 0,
        total: 0,
        has_more: false,
        next_offset: null
      }
    };

    getMock.mockResolvedValue({
      data: response
    });

    await expect(ProductsAPI.listProducts({ offset: 25, limit: 25 })).resolves.toEqual(response);

    expect(getMock).toHaveBeenCalledWith('/products', {
      params: {
        offset: 25,
        limit: 25
      }
    });
  });

  it('creates a product through the backend products endpoint', async () => {
    const payload: CreateProductPayload = {
      sku: 'PAP-003',
      name: 'Vanilla Cake',
      base_price_cents: 1299,
      tax_code: 'NOR',
      allow_pickup: true,
      allow_inhouse: true,
      allow_eurosender: false,
      product_variants: [
        {
          flavor: 'Vanilla'
        }
      ]
    };
    const createdProduct: Product = {
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

    postMock.mockResolvedValue({
      data: createdProduct
    });

    await expect(ProductsAPI.createProduct(payload)).resolves.toEqual(createdProduct);

    expect(postMock).toHaveBeenCalledWith('/products', payload);
  });
});
