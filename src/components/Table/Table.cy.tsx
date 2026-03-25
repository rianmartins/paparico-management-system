import { useState } from 'react';
import { mount } from 'cypress/react';

import Table from './Table';
import type { TableSortState } from './type';

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  price: number;
  status: string;
};

const rows: ProductRow[] = [
  { id: '1', name: 'Chocolate Cake', sku: 'CK-01', price: 22, status: 'Active' },
  { id: '2', name: 'Apple Pie', sku: 'AP-02', price: 14, status: 'Draft' },
  { id: '3', name: 'Vanilla Tart', sku: 'VT-03', price: 18, status: 'Active' }
];

const columns = [
  {
    id: 'name',
    header: 'Name',
    accessor: 'name',
    sortable: true,
    mobileVisibility: 'always'
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
    align: 'right',
    sortable: true,
    mobileVisibility: 'desktop'
  }
] as const;

function ControlledSortHarness() {
  const [sortState, setSortState] = useState<TableSortState | null>(null);

  return <Table columns={columns} data={rows} onSortChange={setSortState} rowKey="id" sortState={sortState} />;
}

describe('Table', () => {
  it('sorts ascending, descending, and back to unsorted through header interaction', () => {
    mount(<Table columns={columns} data={rows} rowKey="id" />);

    cy.get('tbody tr').eq(0).should('contain.text', 'Chocolate Cake');

    cy.contains('button', 'Name').click();
    cy.get('tbody tr').eq(0).should('contain.text', 'Apple Pie');

    cy.contains('button', 'Name').click();
    cy.get('tbody tr').eq(0).should('contain.text', 'Vanilla Tart');

    cy.contains('button', 'Name').click();
    cy.get('tbody tr').eq(0).should('contain.text', 'Chocolate Cake');
  });

  it('supports controlled sorting via parent-managed sort state', () => {
    mount(<ControlledSortHarness />);

    cy.contains('button', 'Name').click();
    cy.get('tbody tr').eq(0).should('contain.text', 'Apple Pie');
  });

  it('calls row action handlers for the correct row', () => {
    const editAction = cy.stub().as('editAction');

    mount(
      <Table
        columns={columns}
        data={rows}
        rowActions={[
          {
            label: 'Edit',
            onClick: editAction
          }
        ]}
        rowKey="id"
      />
    );

    cy.get('tbody tr')
      .eq(1)
      .within(() => {
        cy.contains('button', 'Edit').click();
      });

    cy.get('@editAction').should('have.been.calledOnce');
    cy.get('@editAction').its('firstCall.args.0').should('deep.equal', rows[1]);
  });

  it('respects disabled row actions', () => {
    const editAction = cy.stub().as('editAction');

    mount(
      <Table
        columns={columns}
        data={rows}
        rowActions={[
          {
            label: 'Edit',
            disabled: (row) => row.status === 'Draft',
            onClick: editAction
          }
        ]}
        rowKey="id"
      />
    );

    cy.get('tbody tr')
      .eq(1)
      .within(() => {
        cy.contains('button', 'Edit').should('be.disabled');
      });
  });

  it('hides configured columns responsively and keeps the table scrollable', () => {
    mount(<Table columns={columns} data={rows} rowKey="id" />);

    cy.viewport(1200, 800);
    cy.contains('th', 'Price').should('be.visible');

    cy.viewport(900, 800);
    cy.contains('th', 'Price').should('not.be.visible');
    cy.get('[data-testid="table-wrapper"]').should('have.css', 'overflow-x', 'auto');

    cy.viewport(600, 800);
    cy.contains('th', 'SKU').should('not.be.visible');
  });

  it('shows loading and empty states', () => {
    mount(<Table columns={columns} data={rows} isLoading rowKey="id" />);
    cy.contains('Loading...').should('be.visible');

    mount(<Table columns={columns} data={[]} emptyMessage="No products yet." rowKey="id" />);
    cy.contains('No products yet.').should('be.visible');
  });
});
