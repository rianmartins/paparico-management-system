'use client';

import { useEffect, useState } from 'react';

import { ApiError } from '@/api/errors';
import ProductsService from '@/service/ProductsService';
import type { Product } from '@/types/Products';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const productsResponse = await ProductsService.listProducts();

        if (!isMounted) {
          return;
        }

        setProducts(productsResponse);
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const fallbackMessage = 'Unable to load products right now.';

        if (error instanceof ApiError) {
          setErrorMessage(error.message);
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : fallbackMessage);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
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
