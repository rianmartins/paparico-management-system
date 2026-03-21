import ProductsAPI from '@/api/ProductsAPI';
import type { ListProductsResponse } from '@/types/Products';

export class ProductsService {
  async listProducts(): Promise<ListProductsResponse> {
    return ProductsAPI.listProducts();
  }
}

const productsService = new ProductsService();

export default productsService;
