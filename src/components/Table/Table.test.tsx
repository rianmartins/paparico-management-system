import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
  it('renders semantic table structure and caption', () => {
    render(<Table caption="Products overview" columns={columns} data={rows} rowKey="id" />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Products overview')).toBeInTheDocument();
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
});
