'use client';

import { useProductsQuery } from './query';

import styles from './ProductList.module.css';

function formatPrice(basePriceCents: number) {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(basePriceCents / 100);
}

function formatIdentifier(value: bigint | string) {
  return String(value);
}

export default function ProductList() {
  const { data: products = [], isPending } = useProductsQuery();

  if (isPending) {
    return <p className={styles.stateMessage}>Loading products...</p>;
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
