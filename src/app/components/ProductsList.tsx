'use client';

import { ApiError } from '@/api/errors';
import { useProductsQuery } from '@/features/products';

import styles from '../page.module.css';

function formatPrice(basePriceCents: number) {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(basePriceCents / 100);
}

function formatIdentifier(value: bigint | string) {
  return String(value);
}

export default function ProductsList() {
  const { data: products = [], error, isPending } = useProductsQuery();

  let errorMessage: string | null = null;

  if (error instanceof ApiError) {
    errorMessage = error.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error) {
    errorMessage = 'Unable to load products right now.';
  }

  if (isPending) {
    return <p className={styles.stateMessage}>Loading products...</p>;
  }

  if (errorMessage) {
    return <p className={styles.stateMessage}>{errorMessage}</p>;
  }

  if (products.length === 0) {
    return <p className={styles.stateMessage}>No products available yet.</p>;
  }

  return (
    <div className={styles.productsList}>
      {products.map((product) => (
        <article key={formatIdentifier(product.id)} className={styles.productCard}>
          <div className={styles.productHeader}>
            <div>
              <p className={styles.productSku}>{product.sku ?? 'No SKU'}</p>
              <h2>{product.name}</h2>
            </div>
            <span className={styles.productPrice}>{formatPrice(product.base_price_cents)}</span>
          </div>

          <p className={styles.productDescription}>{product.description ?? 'No description available.'}</p>

          <dl className={styles.productMeta}>
            <div>
              <dt>Status</dt>
              <dd>{product.is_active ? 'Active' : 'Inactive'}</dd>
            </div>
            <div>
              <dt>Variants</dt>
              <dd>{product.product_variants.length}</dd>
            </div>
            <div>
              <dt>Pickup</dt>
              <dd>{product.allow_pickup ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt>In-house</dt>
              <dd>{product.allow_inhouse ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}
