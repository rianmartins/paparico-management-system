import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProductsAPI from '@/api/ProductsAPI';
import { getAxiosClient } from '@/api/axiosClient';
import type { ListProductsResponse } from '@/types/Products';

vi.mock('@/api/axiosClient', () => ({
  getAxiosClient: vi.fn()
}));

const getMock = vi.fn();
const mockedGetAxiosClient = vi.mocked(getAxiosClient);

describe('ProductsAPI', () => {
  beforeEach(() => {
    getMock.mockReset();
    mockedGetAxiosClient.mockReset();
    mockedGetAxiosClient.mockReturnValue({
      get: getMock
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
});
