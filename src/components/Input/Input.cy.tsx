import { mount } from 'cypress/react';

import Input from './Input';

describe('Input', () => {
  it('uses a provided id and associates the label correctly', () => {
    mount(<Input id="product-search" label="Search products" />);

    cy.get('input[id="product-search"]').should('exist');
    cy.contains('label', 'Search products').should('have.attr', 'for', 'product-search');
  });

  it('renders hint and error descriptions accessibly', () => {
    mount(<Input error="Search term is invalid." hint="Use product name or SKU." label="Search" />);

    cy.get('input').then(($input) => {
      const inputId = $input.attr('id');

      expect($input).to.have.attr('aria-invalid', 'true');
      expect($input.attr('aria-describedby')).to.contain(`${inputId}-hint`);
      expect($input.attr('aria-describedby')).to.contain(`${inputId}-error`);
    });

    cy.contains('Use product name or SKU.').should('be.visible');
    cy.contains('Search term is invalid.').should('be.visible');
  });

  it('supports uncontrolled usage for filters and search', () => {
    mount(<Input defaultValue="Initial search" label="Filter" />);

    cy.get('input').should('have.value', 'Initial search');
  });

  it('forwards onChange in controlled usage', () => {
    const handleChange = cy.stub().as('handleChange');

    mount(<Input label="Filter" onChange={handleChange} value="Chocolate cake" />);

    cy.get('input').type('a');
    cy.get('@handleChange').should('have.been.called');
  });

  it('respects the disabled state', () => {
    mount(<Input disabled label="Filter" />);

    cy.get('input').should('be.disabled');
  });

  it('preserves an existing aria-describedby value', () => {
    mount(<Input aria-describedby="external-description" hint="Use product name or SKU." label="Search" />);

    cy.get('input').should(($input) => {
      const inputId = $input.attr('id');
      const describedBy = $input.attr('aria-describedby');

      expect(describedBy).to.contain('external-description');
      expect(describedBy).to.contain(`${inputId}-hint`);
    });
  });
});
