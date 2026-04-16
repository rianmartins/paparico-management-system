import AppSidebar from '@/features/AppSidebar';
import ProductList from '@/features/Products/ProductList';

import styles from './page.module.css';

export default function ProductsPage() {
  return (
    <div className={styles.page}>
      <AppSidebar />

      <div className={styles.contentShell}>
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
