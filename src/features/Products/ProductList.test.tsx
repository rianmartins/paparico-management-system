import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ProductsAPI from '@/api/ProductsAPI';
import { ApiError } from '@/api/errors';
import ToastProvider from '@/components/Toast/ToastProvider';
import productsStore from '@/store/ProductsStore';
import TestErrorBoundary from '@/test/TestErrorBoundary';
import type { ListProductsMeta, ListProductsResponse, Product } from '@/types/Products';

import ProductList from './ProductList';

vi.mock('@/api/ProductsAPI', () => ({
  default: {
    listProducts: vi.fn(),
    updateProduct: vi.fn(),
    saveProductVariants: vi.fn(),
    deleteProductVariant: vi.fn()
  }
}));

const mockedListProducts = vi.mocked(ProductsAPI.listProducts);
const mockedUpdateProduct = vi.mocked(ProductsAPI.updateProduct);
const mockedSaveProductVariants = vi.mocked(ProductsAPI.saveProductVariants);
const mockedDeleteProductVariant = vi.mocked(ProductsAPI.deleteProductVariant);

const productFixture: Product = {
  id: '1',
  sku: 'PAP-001',
  name: 'Chocolate Cake',
  description: 'Rich chocolate sponge cake.',
  base_price_cents: 1299,
  tax_code: 'INT',
  tax_id: '2',
  weight_grams: 500,
  length_cm: 20,
  width_cm: 20,
  height_cm: 8,
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

const searchedProductFixture: Product = {
  ...productFixture,
  id: '2',
  sku: 'PAP-002',
  name: 'Seasonal Tart',
  base_price_cents: 1599,
  is_active: false,
  allow_pickup: false,
  allow_inhouse: false,
  product_variants: [
    {
      id: '10',
      product_id: '2',
      variant_code: 'MINI',
      flavor: 'Mini',
      price_override_cents: null,
      is_active: true,
      allow_pickup: null,
      allow_inhouse: null,
      allow_eurosender: null,
      external_toconline_product_id: null,
      external_toconline_item_code: null
    }
  ]
};

function listProductsResponseFixture(
  products: Product[],
  metaOverrides: Partial<ListProductsMeta> = {}
): ListProductsResponse {
  const offset = metaOverrides.offset ?? 0;
  const limit = metaOverrides.limit ?? products.length;
  const count = metaOverrides.count ?? products.length;
  const total = metaOverrides.total ?? products.length;

  return {
    data: products,
    meta: {
      offset,
      limit,
      count,
      total,
      has_more: metaOverrides.has_more ?? offset + count < total,
      next_offset: metaOverrides.next_offset ?? (offset + limit < total ? offset + limit : null)
    }
  };
}

function renderProductList() {
  void productsStore.loadProducts();
  return render(<ProductList />);
}

function renderProductListWithToast() {
  void productsStore.loadProducts();
  return render(
    <ToastProvider>
      <ProductList />
    </ToastProvider>
  );
}

describe('ProductList', () => {
  const originalShowModal = HTMLDialogElement.prototype.showModal;
  const originalClose = HTMLDialogElement.prototype.close;

  beforeEach(() => {
    productsStore.reset();
    mockedListProducts.mockReset();
    mockedUpdateProduct.mockReset();
    mockedSaveProductVariants.mockReset();
    mockedDeleteProductVariant.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    HTMLDialogElement.prototype.showModal = vi.fn(function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.close = vi.fn(function close(this: HTMLDialogElement) {
      this.removeAttribute('open');
    });
  });

  afterEach(() => {
    vi.mocked(console.error).mockRestore();
    HTMLDialogElement.prototype.showModal = originalShowModal;
    HTMLDialogElement.prototype.close = originalClose;
  });

  it('renders the loading state before the request resolves', () => {
    mockedListProducts.mockReturnValue(new Promise(() => undefined));

    renderProductList();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders products returned by the service in the table', async () => {
    mockedListProducts.mockResolvedValue(listProductsResponseFixture([productFixture]));

    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    });

    const table = screen.getByRole('table');

    expect(within(table).getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'SKU' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Price' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Variants' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Pickup' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'In-house' })).toBeInTheDocument();

    const productRow = screen.getByText('Chocolate Cake').closest('tr');

    if (!productRow) {
      throw new Error('Expected product table row to render.');
    }

    expect(within(productRow).getByText('PAP-001')).toBeInTheDocument();
    expect(within(productRow).getByText('12,99 €')).toBeInTheDocument();
    expect(within(productRow).getByText('Active')).toBeInTheDocument();
    expect(within(productRow).getByText('0')).toBeInTheDocument();
    expect(within(productRow).getAllByText('Yes')).toHaveLength(2);
    expect(within(table).queryAllByRole('button')).toHaveLength(0);
  });

  it('opens the edit modal with current product values when a row is clicked', async () => {
    mockedListProducts.mockResolvedValue(listProductsResponseFixture([productFixture]));

    renderProductListWithToast();

    await waitFor(() => {
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    });

    const productRow = screen.getByText('Chocolate Cake').closest('tr');

    if (!productRow) {
      throw new Error('Expected product table row to render.');
    }

    fireEvent.click(productRow);

    expect(screen.getByRole('dialog', { name: 'Edit product' })).toHaveAttribute('open');
    expect(screen.getByLabelText('SKU')).toHaveValue('PAP-001');
    expect(screen.getByLabelText('Name')).toHaveValue('Chocolate Cake');
    expect(screen.getByLabelText('Base price')).toHaveValue('12,99');
    expect(screen.getByRole('combobox', { name: 'Tax rate' })).toHaveValue('INT');
    expect(screen.getByLabelText('Pickup')).toBeChecked();
    expect(screen.getByLabelText('In-house')).toBeChecked();
    expect(screen.getByLabelText('Eurosender')).not.toBeChecked();
  });

  it('updates a product from the row edit modal and closes it on success', async () => {
    mockedListProducts.mockResolvedValue(listProductsResponseFixture([productFixture]));
    mockedUpdateProduct.mockResolvedValue({
      ...productFixture,
      name: 'Chocolate Celebration Cake'
    });
    const { container } = renderProductListWithToast();

    await waitFor(() => {
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    });

    const productRow = screen.getByText('Chocolate Cake').closest('tr');

    if (!productRow) {
      throw new Error('Expected product table row to render.');
    }

    fireEvent.click(productRow);
    fireEvent.change(screen.getByLabelText('Name'), {
      target: {
        value: ' Chocolate Celebration Cake '
      }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update product' }));

    await waitFor(() => {
      expect(mockedUpdateProduct).toHaveBeenCalledWith('1', {
        sku: 'PAP-001',
        name: 'Chocolate Celebration Cake',
        base_price_cents: 1299,
        tax_code: 'INT',
        allow_pickup: true,
        allow_inhouse: true,
        allow_eurosender: false
      });
    });
    expect(mockedSaveProductVariants).not.toHaveBeenCalled();

    expect(await screen.findByText('The product has been updated.')).toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelector('dialog')).not.toBeInTheDocument();
    });
  });

  it('renders the empty state when no products are returned', async () => {
    mockedListProducts.mockResolvedValue(listProductsResponseFixture([]));

    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('No products available yet.')).toBeInTheDocument();
    });
  });

  it('fetches searched products when the search form is submitted', async () => {
    mockedListProducts
      .mockResolvedValueOnce(listProductsResponseFixture([productFixture]))
      .mockResolvedValueOnce(listProductsResponseFixture([searchedProductFixture]));

    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('textbox', { name: 'Search products' }), {
      target: {
        value: ' Seasonal '
      }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(screen.getByText('Seasonal Tart')).toBeInTheDocument();
    });

    expect(screen.queryByText('Chocolate Cake')).not.toBeInTheDocument();
    expect(screen.getByText('PAP-002')).toBeInTheDocument();
    expect(screen.getByText('15,99 €')).toBeInTheDocument();
    expect(mockedListProducts).toHaveBeenCalledTimes(2);
    expect(mockedListProducts).toHaveBeenNthCalledWith(1, { offset: 0, limit: 20 });
    expect(mockedListProducts).toHaveBeenNthCalledWith(2, { q: 'Seasonal', offset: 0, limit: 20 });
  });

  it('fetches the next product page with offset and limit params', async () => {
    mockedListProducts
      .mockResolvedValueOnce(
        listProductsResponseFixture([productFixture], {
          offset: 0,
          limit: 20,
          count: 20,
          total: 40,
          has_more: true,
          next_offset: 20
        })
      )
      .mockResolvedValueOnce(
        listProductsResponseFixture([searchedProductFixture], {
          offset: 20,
          limit: 20,
          count: 20,
          total: 40,
          has_more: false,
          next_offset: null
        })
      );

    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    await waitFor(() => {
      expect(screen.getByText('Seasonal Tart')).toBeInTheDocument();
    });

    expect(screen.queryByText('Chocolate Cake')).not.toBeInTheDocument();
    expect(mockedListProducts).toHaveBeenCalledTimes(2);
    expect(mockedListProducts).toHaveBeenNthCalledWith(1, { offset: 0, limit: 20 });
    expect(mockedListProducts).toHaveBeenNthCalledWith(2, { offset: 20, limit: 20 });
  });

  it('bubbles failed product requests into the nearest error boundary', async () => {
    mockedListProducts.mockRejectedValue(
      new ApiError({
        status: 500,
        code: 'HTTP_500',
        message: 'The server could not process the request.'
      })
    );

    void productsStore.loadProducts();
    render(
      <TestErrorBoundary fallback={<p>Products boundary fallback</p>}>
        <ProductList />
      </TestErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText('Products boundary fallback')).toBeInTheDocument();
    });

    expect(screen.queryByText('The server could not process the request.')).not.toBeInTheDocument();
  });
});
