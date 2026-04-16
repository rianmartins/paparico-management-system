import { mount } from 'cypress/react';

import Sidebar from './Sidebar';

describe('Sidebar', () => {
  it('renders arbitrary children in a fixed full-height left sidebar', () => {
    mount(
      <>
        <Sidebar aria-label="Management navigation" data-testid="sidebar">
          <nav aria-label="Management sections">
            <a href="/products">Products</a>
            <a href="/settings">Settings</a>
          </nav>
        </Sidebar>
        <main data-testid="content" style={{ marginLeft: '15rem', padding: '1rem' }}>
          Page content
        </main>
      </>
    );

    cy.get('[data-testid="sidebar"]').should('have.css', 'position', 'fixed');
    cy.get('[data-testid="sidebar"]').should(($sidebar) => {
      const { height, left, top } = $sidebar[0].getBoundingClientRect();

      expect(left).to.be.closeTo(0, 1);
      expect(top).to.be.closeTo(0, 1);
      expect(height).to.be.closeTo(Cypress.config('viewportHeight'), 2);
    });

    cy.get('nav[aria-label="Management sections"]').should('be.visible');
    cy.contains('a', 'Products').should('have.attr', 'href', '/products');
    cy.contains('a', 'Settings').should('have.attr', 'href', '/settings');
    cy.get('[data-testid="content"]').should('contain.text', 'Page content');
  });

  it('scrolls overflowing sidebar children without covering the content area', () => {
    mount(
      <>
        <Sidebar aria-label="Management navigation" data-testid="sidebar">
          <nav aria-label="Long navigation">
            {Array.from({ length: 80 }, (_, index) => (
              <a href={`/item-${index}`} key={index}>
                Item {index + 1}
              </a>
            ))}
          </nav>
        </Sidebar>
        <main data-testid="content" style={{ marginLeft: '15rem', padding: '1rem' }}>
          Content remains visible
        </main>
      </>
    );

    cy.get('[data-testid="sidebar"]')
      .should('have.css', 'overflow-y', 'auto')
      .and(($sidebar) => {
        const element = $sidebar[0];

        expect(element.scrollHeight).to.be.greaterThan(element.clientHeight);
      });

    cy.get('[data-testid="sidebar"]').then(($sidebar) => {
      const sidebarRight = $sidebar[0].getBoundingClientRect().right;

      cy.get('[data-testid="content"]').should(($content) => {
        const contentLeft = $content[0].getBoundingClientRect().left;

        expect(contentLeft).to.be.at.least(sidebarRight - 1);
      });
    });

    cy.contains('[data-testid="content"]', 'Content remains visible').should('be.visible');
  });
});
