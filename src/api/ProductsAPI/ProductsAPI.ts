import { getAxiosClient } from '@/api/axiosClient';
import type {
  CreateProductPayload,
  ListProductsParams,
  ListProductsResponse,
  Product,
  ProductBigInt,
  ProductVariant,
  UpdateProductPayload,
  UpsertProductVariantPayload
} from '@/types/Products';

export class ProductsAPI {
  async listProducts(params: ListProductsParams = {}): Promise<ListProductsResponse> {
    const hasParams = Object.keys(params).length > 0;
    const response = hasParams
      ? await getAxiosClient().get<ListProductsResponse>('/products', { params })
      : await getAxiosClient().get<ListProductsResponse>('/products');

    return response.data;
  }

  async createProduct(payload: CreateProductPayload): Promise<Product> {
    const response = await getAxiosClient().post<Product>('/products', payload);

    return response.data;
  }

  async updateProduct(id: ProductBigInt, payload: UpdateProductPayload): Promise<Product> {
    const response = await getAxiosClient().put<Product>(`/products/${String(id)}`, payload);

    return response.data;
  }

  async saveProductVariants(
    productId: ProductBigInt,
    payload: UpsertProductVariantPayload[]
  ): Promise<ProductVariant[]> {
    const response = await getAxiosClient().post<ProductVariant[]>(`/products/${String(productId)}/variants`, payload);

    return response.data;
  }

  async deleteProductVariant(productId: ProductBigInt, variantId: ProductBigInt | number): Promise<void> {
    const response = await getAxiosClient().delete<void>(
      `/products/${String(productId)}/variants/${String(variantId)}`
    );

    return response.data;
  }
}

const productsAPI = new ProductsAPI();

export default productsAPI;
