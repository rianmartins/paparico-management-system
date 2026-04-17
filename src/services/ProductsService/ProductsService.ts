import ProductsAPI from '@/api/ProductsAPI';
import type { ListProductsParams, ListProductsResponse } from '@/types/Products';

function normalizeListProductsParams(params: ListProductsParams = {}): ListProductsParams {
  const normalizedParams: ListProductsParams = {};
  const q = params.q?.trim();

  if (q) {
    normalizedParams.q = q;
  }

  if (typeof params.offset === 'number') {
    normalizedParams.offset = params.offset;
  }

  if (typeof params.limit === 'number') {
    normalizedParams.limit = params.limit;
  }

  return normalizedParams;
}

export class ProductsService {
  async loadProducts(params: ListProductsParams = {}): Promise<ListProductsResponse> {
    const normalizedParams = normalizeListProductsParams(params);

    if (Object.keys(normalizedParams).length > 0) {
      return ProductsAPI.listProducts(normalizedParams);
    }

    return ProductsAPI.listProducts();
  }
}

const productsService = new ProductsService();

export default productsService;
