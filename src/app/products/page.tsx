import LogoutButton from '@/features/Auth/LogoutButton';
import ProductList from '@/features/Products/ProductList';

import styles from './page.module.css';

export default function ProductsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.productsHeader}>
        <div className={styles.productsHeaderInner}>
          <h3 className={styles.productsHeaderBrand}>Paparico Management</h3>
          <LogoutButton />
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Catalog workspace</p>
          <h1>Catalog overview</h1>
          <p className={styles.heroText}>This page fetches the product catalog directly from the backend API.</p>
        </section>

        <section className={styles.content}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Catalog overview</h2>
              <p>Live product data from the `/products` endpoint.</p>
            </div>
          </div>

          <ProductList />
        </section>
      </main>
    </div>
  );
}
