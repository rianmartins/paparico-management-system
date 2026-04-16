import AppSidebar from '@/features/AppSidebar';
import LogoutButton from '@/features/Auth/LogoutButton';
import ProductList from '@/features/Products/ProductList';

import styles from './page.module.css';

export default function ProductsPage() {
  return (
    <div className={styles.page}>
      <AppSidebar />

      <div className={styles.contentShell}>
        <header className={styles.productsHeader}>
          <div className={styles.productsHeaderInner}>
            <h3 className={styles.productsHeaderBrand}>Paparico Management</h3>
            <LogoutButton />
          </div>
        </header>

        <main className={styles.main}>
          <h1>Products</h1>
          <section className={styles.content}>
            <ProductList />
          </section>
        </main>
      </div>
    </div>
  );
}
