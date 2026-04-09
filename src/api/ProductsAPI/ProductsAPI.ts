import { getAxiosClient } from '@/api/axiosClient';
import type { ListProductsResponse } from '@/types/Products';

export class ProductsAPI {
  async listProducts(): Promise<ListProductsResponse> {
    const response = await getAxiosClient().get<ListProductsResponse>('/products');

    return response.data;
  }
}

const productsAPI = new ProductsAPI();

export default productsAPI;
