'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';

import Button from '@/components/Button';
import Input from '@/components/Input';
import Table, { type TableColumn } from '@/components/Table';
import { selectProductsTableRows } from '@/services/ProductsService';
import type { ListProductsMeta, ListProductsResponse, Product, ProductTableRow } from '@/types/Products';

import { useProductsValue } from './query';
import ProductsModal from './ProductsModal';

import styles from './ProductList.module.css';

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

const PAGE_SIZE = 20;

type ProductTableView = {
  rows: ProductTableRow[];
  products: Product[];
  meta: ListProductsMeta;
};

function selectProductTableView(productsResponse: ListProductsResponse): ProductTableView {
  return {
    rows: selectProductsTableRows(productsResponse),
    products: productsResponse.data,
    meta: productsResponse.meta
  };
}

export default function ProductList() {
  const [searchValue, setSearchValue] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const {
    data: tableView,
    isPending,
    refetch
  } = useProductsValue(selectProductTableView, {
    q: submittedSearch,
    offset,
    limit: PAGE_SIZE
  });

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchValue(event.target.value);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextSearch = searchValue.trim();

    if (nextSearch === submittedSearch) {
      if (offset !== 0) {
        setOffset(0);
        return;
      }

      void refetch();
      return;
    }

    setSubmittedSearch(nextSearch);
    setOffset(0);
  }

  function handleRowClick(row: ProductTableRow) {
    const product = tableView?.products.find((candidate) => String(candidate.id) === row.id);

    if (product) {
      setEditingProduct(product);
    }
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
          value={searchValue}
        />
        <Button className={styles.searchButton} type="submit">
          Search
        </Button>
      </form>

      <Table<ProductTableRow>
        columns={productColumns}
        data={tableView?.rows ?? []}
        emptyMessage="No products available yet."
        isLoading={isPending}
        onRowClick={handleRowClick}
        pagination={
          tableView
            ? {
                offset: tableView.meta.offset,
                limit: tableView.meta.limit,
                total: tableView.meta.total,
                onPageChange: (nextPagination) => setOffset(nextPagination.offset)
              }
            : undefined
        }
        rowKey="id"
      />

      {editingProduct ? (
        <ProductsModal isOpen onClose={() => setEditingProduct(null)} product={editingProduct} />
      ) : null}
    </div>
  );
}
