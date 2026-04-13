import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProductsAPI from '@/api/ProductsAPI';
import { getAxiosClient } from '@/api/axiosClient';

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
    getMock.mockResolvedValue({
      data: []
    });

    await ProductsAPI.listProducts();

    expect(getMock).toHaveBeenCalledWith('/products');
  });
});
