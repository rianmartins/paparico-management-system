'use client';

import { makeAutoObservable, runInAction } from 'mobx';

import productsAPI from '@/api/ProductsAPI';
import productsService, { selectProductsTableRows } from '@/services/ProductsService';
import type {
  CreateProductPayload,
  ListProductsMeta,
  ListProductsResponse,
  Product,
  UpdateProductPayload,
  UpsertProductVariantPayload
} from '@/types/Products';

const PAGE_SIZE = 20;

class ProductsStore {
  private _data: ListProductsResponse | null = null;
  private _isLoading = false;
  private _loadError: unknown = null;

  searchValue = '';
  submittedSearch = '';
  offset = 0;

  editingProduct: Product | null = null;
  isCreateModalOpen = false;

  deletingVariantIds: Set<string> = new Set();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isLoading() {
    return this._isLoading;
  }

  get loadError() {
    return this._loadError;
  }

  get isDeletingVariant() {
    return this.deletingVariantIds.size > 0;
  }

  get data() {
    return this._data;
  }

  get tableRows() {
    return this._data ? selectProductsTableRows(this._data) : [];
  }

  get meta(): ListProductsMeta | null {
    return this._data?.meta ?? null;
  }

  get products(): Product[] {
    return this._data?.data ?? [];
  }

  setSearchValue(value: string) {
    this.searchValue = value;
  }

  submitSearch() {
    this.submittedSearch = this.searchValue.trim();
    this.offset = 0;
    void this.loadProducts();
  }

  setOffset(offset: number) {
    this.offset = offset;
    void this.loadProducts();
  }

  openEditModal(product: Product) {
    this.editingProduct = product;
  }

  closeEditModal() {
    this.editingProduct = null;
  }

  openCreateModal() {
    this.isCreateModalOpen = true;
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
  }

  reset() {
    this._data = null;
    this._isLoading = false;
    this._loadError = null;
    this.searchValue = '';
    this.submittedSearch = '';
    this.offset = 0;
    this.editingProduct = null;
    this.isCreateModalOpen = false;
    this.deletingVariantIds = new Set();
  }

  async loadProducts() {
    runInAction(() => {
      this._isLoading = true;
      this._loadError = null;
    });
    try {
      const data = await productsService.loadProducts({
        q: this.submittedSearch || undefined,
        offset: this.offset,
        limit: PAGE_SIZE
      });
      runInAction(() => {
        this._data = data;
        this._isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this._loadError = error;
        this._isLoading = false;
      });
    }
  }

  async createProduct(payload: CreateProductPayload) {
    await productsAPI.createProduct(payload);
    await this.loadProducts();
  }

  async updateProduct(productId: string, payload: UpdateProductPayload, variants: UpsertProductVariantPayload[]) {
    await productsAPI.updateProduct(productId, payload);
    if (variants.length > 0) {
      await productsAPI.saveProductVariants(productId, variants);
    }
    await this.loadProducts();
  }

  async deleteVariant(productId: string, variantId: number, onSuccess: () => void) {
    const id = String(variantId);
    runInAction(() => this.deletingVariantIds.add(id));
    try {
      await productsAPI.deleteProductVariant(productId, variantId);
      onSuccess();
      await this.loadProducts();
    } finally {
      runInAction(() => this.deletingVariantIds.delete(id));
    }
  }
}

const productsStore = new ProductsStore();
export default productsStore;
