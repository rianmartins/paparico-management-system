'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import LogoutButton from '@/features/Auth/LogoutButton';
import ProductList from '@/features/Products/ProductList';
import Sidebar from '@/components/Sidebar';

import styles from './page.module.css';
import tabs from '../tabs';

export default function ProductsPage() {
  const [selectedTabId, setSelectedTabId] = useState('products');
  const router = useRouter();

  const handleTabSelect = (tabId: string) => {
    setSelectedTabId(tabId);
    router.push(`/${tabId}`);
  };

  return (
    <div className={styles.page}>
      <header className={styles.productsHeader}>
        <div className={styles.productsHeaderInner}>
          <h3 className={styles.productsHeaderBrand}>Paparico Management</h3>
          <LogoutButton />
        </div>
      </header>

      <main className={styles.main}>
        <Sidebar
          ariaLabel="Management navigation"
          data-testid="sidebar"
          onTabSelect={handleTabSelect}
          selectedTabId={selectedTabId}
          tabs={tabs}
        />
        <div>
          <h1>Products</h1>
          <section className={styles.content}>
            <ProductList />
          </section>
        </div>
      </main>
    </div>
  );
}
