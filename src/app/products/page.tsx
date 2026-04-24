'use client';

import { useState } from 'react';

import Button from '@/components/Button';
import AppSidebar from '@/features/AppSidebar';
import ProductList from '@/features/Products/ProductList';
import ProductsModal from '@/features/Products/ProductsModal';
import type { Product } from '@/types/Products';

import styles from './page.module.css';

export default function ProductsPage() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleModalClose() {
    if (editingProduct) setEditingProduct(null);

    setIsModalOpen(false);
  }

  function handleCreateProduct() {
    setEditingProduct(null);
    setIsModalOpen(true);
  }

  function handleEditProduct(product: Product) {
    setEditingProduct(product);
    setIsModalOpen(true);
  }

  return (
    <div className={styles.page}>
      <AppSidebar />

      <div className={styles.contentShell}>
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>Products</h1>
            <Button aria-haspopup="dialog" onClick={handleCreateProduct} type="button">
              Create product
            </Button>
          </div>
          <section className={styles.content}>
            <ProductList onEditProduct={handleEditProduct} />
          </section>
        </main>
      </div>

      <ProductsModal isOpen={isModalOpen} onClose={handleModalClose} product={editingProduct} />
    </div>
  );
}
