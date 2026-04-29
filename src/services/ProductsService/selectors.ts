import type { ListProductsResponse, Product, ProductBigInt, ProductOption, ProductTableRow } from '@/types/Products';

const productPriceFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR'
});

function formatProductIdentifier(value: ProductBigInt) {
  return String(value);
}

function formatProductPrice(basePriceCents: number) {
  return productPriceFormatter.format(basePriceCents / 100);
}

export function selectActiveProducts(productsResponse: ListProductsResponse): Product[] {
  return productsResponse.data.filter((product) => product.is_active);
}

export function selectProductOptions(productsResponse: ListProductsResponse): ProductOption[] {
  return productsResponse.data.map((product) => ({
    value: formatProductIdentifier(product.id),
    label: product.name,
    disabled: !product.is_active
  }));
}

export function selectProductsTableRows(productsResponse: ListProductsResponse): ProductTableRow[] {
  return productsResponse.data.map((product) => ({
    id: formatProductIdentifier(product.id),
    name: product.name,
    weightGrams: product.weight_grams != null ? `${product.weight_grams}g` : '—',
    variants: product.product_variants.map((v) => v.flavor),
    price: formatProductPrice(product.base_price_cents),
    isActive: product.is_active
  }));
}
