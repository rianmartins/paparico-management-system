import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Table from '@/components/Table';

import styles from './Table.module.css';

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  price: number;
  status: string;
};

const rows: ProductRow[] = [
  { id: '1', name: 'Chocolate Cake', sku: 'CK-01', price: 22, status: 'Active' },
  { id: '2', name: 'Vanilla Tart', sku: 'VT-02', price: 18, status: 'Draft' }
];

const columns = [
  {
    id: 'name',
    header: 'Name',
    accessor: 'name'
  },
  {
    id: 'sku',
    header: 'SKU',
    accessor: 'sku'
  },
  {
    id: 'status',
    header: 'Status',
    render: (row: ProductRow) => <strong>{row.status}</strong>,
    sortable: true
  }
] as const;

describe('Table', () => {
  it('renders semantic table structure', () => {
    render(<Table columns={columns} data={rows} rowKey="id" />);

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('applies base and structural classes', () => {
    render(<Table columns={columns} data={rows} rowKey="id" />);

    expect(screen.getByTestId('table-wrapper').className).toContain(styles.TableWrapper);
    expect(screen.getByRole('table').className).toContain(styles.Table);
  });

  it('renders cell text from accessor columns and custom render columns', () => {
    render(<Table columns={columns} data={rows} rowKey="id" />);

    expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    expect(screen.getByText('CK-01')).toBeInTheDocument();
    expect(screen.getByText('Active').tagName).toBe('STRONG');
  });

  it('renders loading and empty states', () => {
    const { rerender } = render(<Table columns={columns} data={rows} isLoading rowKey="id" />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    rerender(<Table columns={columns} data={[]} emptyMessage="No products yet." rowKey="id" />);

    expect(screen.getByText('No products yet.')).toBeInTheDocument();
  });

  it('renders sortable headers and action labels when configured', () => {
    render(
      <Table
        columns={columns}
        data={rows}
        rowActions={[
          {
            label: 'Edit',
            onClick: () => undefined
          }
        ]}
        rowKey="id"
      />
    );

    expect(screen.getByRole('button', { name: /status/i })).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
  });

  it('renders compact pagination and emits offset changes', () => {
    const handlePageChange = vi.fn();

    render(
      <Table
        columns={columns}
        data={rows}
        pagination={{
          offset: 0,
          limit: 25,
          total: 125,
          onPageChange: handlePageChange
        }}
        rowKey="id"
      />
    );

    const pagination = screen.getByRole('navigation', { name: 'Table pagination' });

    expect(screen.getByText('Showing 1-25 of 125')).toBeInTheDocument();
    expect(within(pagination).getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(within(pagination).getByRole('button', { name: 'Page 1, current page' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(within(pagination).getByText('...')).toBeInTheDocument();
    expect(within(pagination).getByRole('button', { name: 'Page 5' })).toBeInTheDocument();

    fireEvent.click(within(pagination).getByRole('button', { name: 'Next page' }));

    expect(handlePageChange).toHaveBeenCalledWith({
      page: 2,
      offset: 25,
      limit: 25
    });
  });

  it('calculates the current pagination page from the offset', () => {
    render(
      <Table
        columns={columns}
        data={rows}
        pagination={{
          offset: 75,
          limit: 25,
          total: 250,
          onPageChange: () => undefined
        }}
        rowKey="id"
      />
    );

    const pagination = screen.getByRole('navigation', { name: 'Table pagination' });

    expect(screen.getByText('Showing 76-100 of 250')).toBeInTheDocument();
    expect(within(pagination).getByRole('button', { name: 'Page 4, current page' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('hides pagination when the result set fits on one page', () => {
    render(
      <Table
        columns={columns}
        data={rows}
        pagination={{
          offset: 0,
          limit: 25,
          total: rows.length,
          onPageChange: () => undefined
        }}
        rowKey="id"
      />
    );

    expect(screen.queryByRole('navigation', { name: 'Table pagination' })).not.toBeInTheDocument();
  });
});
