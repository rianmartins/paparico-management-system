'use client';

import { useState } from 'react';

import Button from '@/components/Button';
import AppSidebar from '@/features/AppSidebar';
import ProductList from '@/features/Products/ProductList';
import ProductsModal from '@/features/Products/ProductsModal';
import type { Product } from '@/types/Products';

import pageStyles from '../page.module.css';
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
    <div className={pageStyles.page}>
      <AppSidebar />

      <div className={pageStyles.contentShell}>
        <main className={pageStyles.main}>
          <div className={pageStyles.pageHeader}>
            <div>
              <h1 className={pageStyles.title}>Produtos</h1>
              <p className={pageStyles.subtitle}>Gerencie o catálogo de produtos do Paparico</p>
            </div>
            <Button
              className={styles.newOrderButton}
              aria-haspopup="dialog"
              onClick={handleCreateProduct}
              type="button"
            >
              + Novo Produto
            </Button>
          </div>
          <ProductList onEditProduct={handleEditProduct} />
        </main>
      </div>

      <ProductsModal isOpen={isModalOpen} onClose={handleModalClose} product={editingProduct} />
    </div>
  );
}
