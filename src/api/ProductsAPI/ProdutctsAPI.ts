import { getApiClient } from '@/api/client';
import type { ListProductsResponse } from '@/types/Products';

export class ProductsAPI {
  private readonly client = getApiClient();

  async listProducts(): Promise<ListProductsResponse> {
    const response = await this.client.get<ListProductsResponse>('/products');

    return response.data;
  }
}

const productsAPI = new ProductsAPI();

export default productsAPI;
