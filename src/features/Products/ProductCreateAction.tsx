'use client';

import { useState } from 'react';

import Button from '@/components/Button';

import ProductsModal from './ProductsModal';

export default function ProductCreateAction() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button aria-haspopup="dialog" onClick={() => setIsModalOpen(true)} type="button">
        Create product
      </Button>
      <ProductsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
