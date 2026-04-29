'use client';

import { type ChangeEvent, type FormEvent } from 'react';
import { observer } from 'mobx-react-lite';

import { isUnauthorizedApiError } from '@/api/errors';
import Button from '@/components/Button';
import Chip from '@/components/Chip';
import Input from '@/components/Input';
import Table, { type TableColumn } from '@/components/Table';
import productsStore from '@/store/ProductsStore';
import type { Product, ProductTableRow } from '@/types/Products';

import styles from './ProductList.module.css';
import SearchIcon from '@/icons/SearchIcon';

type ProductListProps = {
  onEditProduct: (product: Product) => void;
};

const productColumns = [
  {
    id: 'name',
    header: 'Nome',
    accessor: 'name'
  },
  {
    id: 'weight_grams',
    header: 'Tamanho',
    accessor: 'weightGrams',
    mobileVisibility: 'tablet'
  },
  {
    id: 'variants',
    header: 'Sabor',
    render: (row: ProductTableRow) => (
      <div className={styles.variantChips}>
        {row.variants.map((flavor) => (
          <Chip key={flavor}>{flavor}</Chip>
        ))}
      </div>
    ),
    mobileVisibility: 'tablet'
  },
  {
    id: 'price',
    header: 'Preço',
    accessor: 'price',
    align: 'right'
  },
  {
    id: 'isActive',
    header: 'Status',
    render: (row: ProductTableRow) => (
      <Chip color={row.isActive ? 'success' : 'error'}>{row.isActive ? 'Disponível' : 'Indisponível'}</Chip>
    )
  }
] satisfies readonly TableColumn<ProductTableRow>[];

const ProductList = observer(function ProductList({ onEditProduct }: ProductListProps) {
  const store = productsStore;

  if (store.loadError && !isUnauthorizedApiError(store.loadError)) {
    throw store.loadError;
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    store.setSearchValue(event.target.value);
  }

  function handleRowClick(row: ProductTableRow) {
    const product = store.products.find((p) => String(p.id) === row.id);
    if (product) onEditProduct(product);
  }

  return (
    <div className={styles.productList}>
      <Input
        containerClassName={styles.searchInput}
        leftIcon={<SearchIcon />}
        name="product-search"
        onChange={handleSearchChange}
        placeholder="Buscar produto"
        value={store.searchValue}
        onSubmit={store.submitSearch}
        variant="secondary"
      />

      <Table<ProductTableRow>
        columns={productColumns}
        data={store.tableRows}
        emptyMessage="Nenhum produto encontrado"
        isLoading={store.isLoading}
        onRowClick={handleRowClick}
        pagination={
          store.meta
            ? {
                offset: store.meta.offset,
                limit: store.meta.limit,
                total: store.meta.total,
                onPageChange: (nextPagination) => store.setOffset(nextPagination.offset)
              }
            : undefined
        }
        rowKey="id"
      />
    </div>
  );
});

export default ProductList;
