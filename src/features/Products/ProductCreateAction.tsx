'use client';

import { observer } from 'mobx-react-lite';

import Button from '@/components/Button';
import productsStore from '@/store/ProductsStore';

import ProductsModal from './ProductsModal';

const ProductCreateAction = observer(function ProductCreateAction() {
  return (
    <>
      <Button aria-haspopup="dialog" onClick={productsStore.openCreateModal} type="button">
        Create product
      </Button>
      <ProductsModal isOpen={productsStore.isCreateModalOpen} onClose={productsStore.closeCreateModal} />
    </>
  );
});

export default ProductCreateAction;
