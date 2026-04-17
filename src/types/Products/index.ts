export type ProductBigInt = bigint | string;

export type ProductDecimal = number | string;

export type ProductDateTime = Date | string;

export type ProductTaxCode = 'NOR' | 'INT' | 'RED' | 'ISE';

export type CreateVariantPayload = {
  flavor: string;
};

export type CreateProductPayload = {
  sku: string;
  name: string;
  base_price_cents: number;
  tax_code: ProductTaxCode;
  allow_pickup: boolean;
  allow_inhouse: boolean;
  allow_eurosender: boolean;
  product_variants?: CreateVariantPayload[];
};

export type ProductVariant = {
  id: ProductBigInt;
  product_id: ProductBigInt;
  variant_code: string | null;
  flavor: string;
  price_override_cents: number | null;
  is_active: boolean;
  allow_pickup: boolean | null;
  allow_inhouse: boolean | null;
  allow_eurosender: boolean | null;
  external_toconline_product_id: string | null;
  external_toconline_item_code: string | null;
};

export type Product = {
  id: ProductBigInt;
  sku: string | null;
  name: string;
  description: string | null;
  base_price_cents: number;
  tax_id: ProductBigInt;
  weight_grams: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  is_active: boolean;
  allow_pickup: boolean;
  allow_inhouse: boolean;
  allow_eurosender: boolean;
  max_inhouse_distance_km: ProductDecimal | null;
  notes_shipping: string | null;
  external_toconline_product_id: string | null;
  external_toconline_item_code: string | null;
  created_at: ProductDateTime;
  updated_at: ProductDateTime;
  product_variants: ProductVariant[];
};

export type ProductOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type ProductTableRow = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: string;
  status: 'Active' | 'Inactive';
  variantsCount: number;
  allowPickup: 'Yes' | 'No';
  allowInhouse: 'Yes' | 'No';
};

export type ListProductsMeta = {
  offset: number;
  limit: number;
  count: number;
  total: number;
  has_more: boolean;
  next_offset: number | null;
};

export type ListProductsResponse = {
  data: Product[];
  meta: ListProductsMeta;
};

export type ListProductsParams = {
  q?: string;
  offset?: number;
  limit?: number;
};
