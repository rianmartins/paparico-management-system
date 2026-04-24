'use client';

import { type ChangeEvent, type FormEvent } from 'react';
import { observer } from 'mobx-react-lite';

import { isUnauthorizedApiError } from '@/api/errors';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Table, { type TableColumn } from '@/components/Table';
import productsStore from '@/store/ProductsStore';
import type { Product, ProductTableRow } from '@/types/Products';

import styles from './ProductList.module.css';

type ProductListProps = {
  onEditProduct: (product: Product) => void;
};

const productColumns = [
  {
    id: 'name',
    header: 'Name',
    accessor: 'name'
  },
  {
    id: 'sku',
    header: 'SKU',
    accessor: 'sku',
    mobileVisibility: 'tablet'
  },
  {
    id: 'price',
    header: 'Price',
    accessor: 'price',
    align: 'right'
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status'
  },
  {
    id: 'variants',
    header: 'Variants',
    accessor: 'variantsCount',
    align: 'center',
    mobileVisibility: 'tablet'
  },
  {
    id: 'pickup',
    header: 'Pickup',
    accessor: 'allowPickup',
    align: 'center',
    mobileVisibility: 'desktop'
  },
  {
    id: 'inhouse',
    header: 'In-house',
    accessor: 'allowInhouse',
    align: 'center',
    mobileVisibility: 'desktop'
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

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    store.submitSearch();
  }

  function handleRowClick(row: ProductTableRow) {
    const product = store.products.find((p) => String(p.id) === row.id);
    if (product) onEditProduct(product);
  }

  return (
    <div className={styles.productList}>
      <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
        <Input
          containerClassName={styles.searchInput}
          label="Search products"
          name="product-search"
          onChange={handleSearchChange}
          placeholder="Search by name or SKU"
          value={store.searchValue}
        />
        <Button className={styles.searchButton} type="submit">
          Search
        </Button>
      </form>

      <Table<ProductTableRow>
        columns={productColumns}
        data={store.tableRows}
        emptyMessage="No products available yet."
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
