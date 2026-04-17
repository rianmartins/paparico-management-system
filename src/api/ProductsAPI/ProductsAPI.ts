import { getAxiosClient } from '@/api/axiosClient';
import type { ListProductsParams, ListProductsResponse } from '@/types/Products';

export class ProductsAPI {
  async listProducts(params: ListProductsParams = {}): Promise<ListProductsResponse> {
    const hasParams = Object.keys(params).length > 0;
    const response = hasParams
      ? await getAxiosClient().get<ListProductsResponse>('/products', { params })
      : await getAxiosClient().get<ListProductsResponse>('/products');

    return response.data;
  }
}

const productsAPI = new ProductsAPI();

export default productsAPI;
