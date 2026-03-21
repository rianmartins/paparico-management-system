import ProductsList from './components/ProductsList';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Paparico Management</p>
          <h1>Products</h1>
          <p className={styles.heroText}>
            This page fetches the product catalog from the backend through the shared axios client, the products API,
            and the products service.
          </p>
        </section>

        <section className={styles.content}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Catalog overview</h2>
              <p>Live product data from the `/products` endpoint.</p>
            </div>
          </div>

          <ProductsList />
        </section>
      </main>
    </div>
  );
}
