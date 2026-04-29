import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ProductsAPI from '@/api/ProductsAPI';
import ToastProvider from '@/components/Toast/ToastProvider';
import productsStore from '@/store/ProductsStore';
import type { Product } from '@/types/Products';

import ProductsPage from './page';

vi.mock('@/features/AppSidebar', () => ({
  default: () => <nav>Products navigation</nav>
}));

vi.mock('@/api/ProductsAPI', () => ({
  default: {
    listProducts: vi.fn(),
    updateProduct: vi.fn(),
    saveProductVariants: vi.fn(),
    deleteProductVariant: vi.fn(),
    createProduct: vi.fn()
  }
}));

const mockedListProducts = vi.mocked(ProductsAPI.listProducts);

const productFixture: Product = {
  id: '1',
  sku: 'PAP-001',
  name: 'Chocolate Cake',
  description: null,
  base_price_cents: 1299,
  tax_code: 'INT',
  tax_id: '2',
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

function renderPage() {
  void productsStore.loadProducts();
  return render(
    <ToastProvider>
      <ProductsPage />
    </ToastProvider>
  );
}

describe('ProductsPage (integration)', () => {
  const originalShowModal = HTMLDialogElement.prototype.showModal;
  const originalClose = HTMLDialogElement.prototype.close;

  beforeEach(() => {
    productsStore.reset();
    mockedListProducts.mockReset();
    HTMLDialogElement.prototype.showModal = vi.fn(function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.close = vi.fn(function close(this: HTMLDialogElement) {
      this.removeAttribute('open');
    });
  });

  afterEach(() => {
    HTMLDialogElement.prototype.showModal = originalShowModal;
    HTMLDialogElement.prototype.close = originalClose;
  });

  it('opens the create modal when the Create product button is clicked', () => {
    mockedListProducts.mockReturnValue(new Promise(() => undefined));

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: '+ Novo Produto' }));

    expect(screen.getByRole('dialog', { name: 'Create product' })).toHaveAttribute('open');
  });

  it('opens the edit modal with product data when a table row is clicked', async () => {
    mockedListProducts.mockResolvedValue({
      data: [productFixture],
      meta: { offset: 0, limit: 20, count: 1, total: 1, has_more: false, next_offset: null }
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Chocolate Cake').closest('tr')!);

    expect(screen.getByRole('dialog', { name: 'Edit product' })).toHaveAttribute('open');
    expect(screen.getByLabelText('SKU')).toHaveValue('PAP-001');
    expect(screen.getByLabelText('Name')).toHaveValue('Chocolate Cake');
    expect(screen.getByLabelText('Base price')).toHaveValue('12,99');
    expect(screen.getByRole('combobox', { name: 'Tax rate' })).toHaveValue('INT');
    expect(screen.getByLabelText('Pickup')).toBeChecked();
    expect(screen.getByLabelText('In-house')).toBeChecked();
    expect(screen.getByLabelText('Eurosender')).not.toBeChecked();
  });
});
