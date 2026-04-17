import AppSidebar from '@/features/AppSidebar';
import ProductCreateAction from '@/features/Products/ProductCreateAction';
import ProductList from '@/features/Products/ProductList';

import styles from './page.module.css';

export default function ProductsPage() {
  return (
    <div className={styles.page}>
      <AppSidebar />

      <div className={styles.contentShell}>
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>Products</h1>
            <ProductCreateAction />
          </div>
          <section className={styles.content}>
            <ProductList />
          </section>
        </main>
      </div>
    </div>
  );
}
