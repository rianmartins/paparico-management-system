import type { CSSProperties } from 'react';
import { useState } from 'react';
import { mount } from 'cypress/react';

import Sidebar from './Sidebar';
import type { SidebarTabItem } from './Sidebar';

const tabs: SidebarTabItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <span data-testid="overview-icon">O</span>,
    tooltip: 'View system overview',
    tabId: 'overview-tab',
    panelId: 'overview-panel'
  },
  {
    id: 'products',
    label: 'Products',
    icon: <span data-testid="products-icon">P</span>,
    tooltip: 'Manage products',
    tabId: 'products-tab',
    panelId: 'products-panel'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <span data-testid="settings-icon">S</span>,
    disabled: true,
    tabId: 'settings-tab',
    panelId: 'settings-panel'
  }
];

type SidebarHarnessProps = {
  onTabSelect?: (tabId: string) => void;
};

const layoutStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'stretch',
  width: '100%',
  height: '100dvh',
  overflow: 'visible',
  border: '1px solid var(--color-border-default)'
};

const contentStyle: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  padding: '1rem',
  background: 'var(--color-surface-soft)'
};

function SidebarHarness({ onTabSelect }: SidebarHarnessProps) {
  const [selectedTabId, setSelectedTabId] = useState('overview');
  const selectedTab = tabs.find((tab) => tab.id === selectedTabId) ?? tabs[0];

  function handleTabSelect(tabId: string) {
    setSelectedTabId(tabId);
    onTabSelect?.(tabId);
  }

  return (
    <div data-testid="sidebar-layout" style={layoutStyle}>
      <Sidebar
        ariaLabel="Management navigation"
        data-testid="sidebar"
        onTabSelect={handleTabSelect}
        selectedTabId={selectedTabId}
        tabs={tabs}
      />

      <section aria-labelledby={selectedTab.tabId} id={selectedTab.panelId} role="tabpanel" style={contentStyle}>
        <h2>{selectedTab.label}</h2>
        <p>{selectedTab.id} content</p>
      </section>
    </div>
  );
}

describe('Sidebar', () => {
  it('lets rendered SidebarTabs update the controlled parent state and panel', () => {
    const handleTabSelect = cy.stub().as('handleTabSelect');

    mount(<SidebarHarness onTabSelect={handleTabSelect} />);

    cy.get('[data-testid="sidebar-layout"]').should('have.css', 'display', 'flex');
    cy.get('button[aria-label="Expand sidebar"]').should('not.exist');
    cy.get('[role="tablist"][aria-label="Management navigation"]').should('have.attr', 'aria-orientation', 'vertical');
    cy.get('[data-testid="sidebar"]').should(($sidebar) => {
      const layoutHeight = $sidebar.parent()[0].getBoundingClientRect().height;
      const layoutWidth = $sidebar.parent()[0].getBoundingClientRect().width;
      const { height, width } = $sidebar[0].getBoundingClientRect();

      expect(height).to.be.closeTo(layoutHeight, 2);
      expect(width).to.be.greaterThan(96);
      expect(width).to.be.lessThan(layoutWidth * 0.5);
    });
    cy.get('[role="tabpanel"]').should(($panel) => {
      const layoutWidth = $panel.parent()[0].getBoundingClientRect().width;
      const { width } = $panel[0].getBoundingClientRect();

      expect(width).to.be.greaterThan(layoutWidth * 0.5);
    });
    cy.contains('[role="tab"]', 'Overview')
      .should('have.attr', 'aria-selected', 'true')
      .and('have.attr', 'aria-controls', 'overview-panel')
      .and('have.attr', 'title', 'View system overview');
    cy.get('[role="tabpanel"]').should('have.attr', 'id', 'overview-panel').and('contain.text', 'overview content');
    cy.get('[data-testid="overview-icon"]').should('exist');

    cy.contains('[role="tab"]', 'Products').click();

    cy.get('@handleTabSelect').should('have.been.calledWith', 'products');
    cy.contains('[role="tab"]', 'Products')
      .should('have.attr', 'aria-selected', 'true')
      .and('have.attr', 'tabindex', '0');
    cy.contains('[role="tab"]', 'Overview')
      .should('have.attr', 'aria-selected', 'false')
      .and('have.attr', 'tabindex', '-1');
    cy.get('[role="tabpanel"]').should('have.attr', 'id', 'products-panel').and('contain.text', 'products content');
    cy.get('[data-testid="products-icon"]').should('exist');
  });

  it('uses Sidebar keyboard handling across SidebarTabs and skips disabled tabs', () => {
    mount(<SidebarHarness />);

    cy.contains('[role="tab"]', 'Settings').should('be.disabled');
    cy.contains('[role="tab"]', 'Overview').focus();

    cy.get('[role="tablist"]').trigger('keydown', { key: 'ArrowDown' });

    cy.contains('[role="tab"]', 'Products').should('be.focused').and('have.attr', 'aria-selected', 'true');
    cy.get('[role="tabpanel"]').should('have.attr', 'id', 'products-panel');

    cy.get('[role="tablist"]').trigger('keydown', { key: 'ArrowDown' });

    cy.contains('[role="tab"]', 'Settings').should('have.attr', 'aria-selected', 'false');
    cy.contains('[role="tab"]', 'Overview').should('be.focused').and('have.attr', 'aria-selected', 'true');
    cy.get('[role="tabpanel"]').should('have.attr', 'id', 'overview-panel');
  });

  it('collapses as a drawer while keeping SidebarTabs selectable by icon and tooltip', () => {
    mount(<SidebarHarness />);

    cy.get('[data-testid="sidebar"]').should(($sidebar) => {
      expect($sidebar.css('transition-property')).to.contain('max-width');
    });
    cy.contains('[role="tab"]', 'Overview').click();

    cy.get('button[aria-label="Expand sidebar"]').should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="sidebar"]').should(($sidebar) => {
      const layoutHeight = $sidebar.parent()[0].getBoundingClientRect().height;
      const { height, width } = $sidebar[0].getBoundingClientRect();

      expect(height).to.be.closeTo(layoutHeight, 2);
      expect(width).to.be.lessThan(56);
    });
    cy.get('button[aria-label="Expand sidebar"]').should(($button) => {
      const sidebarBottom = $button.parents('[data-testid="sidebar"]')[0].getBoundingClientRect().bottom;
      const buttonBottom = $button[0].getBoundingClientRect().bottom;

      expect(sidebarBottom - buttonBottom).to.be.lessThan(8);
    });
    cy.contains('[role="tab"]', 'Overview').should('have.attr', 'data-tooltip', 'View system overview');
    cy.contains('[role="tab"]', 'Settings').should('have.attr', 'data-tooltip', 'Settings');
    cy.get('[data-testid="overview-icon"]').should('be.visible');

    cy.contains('[role="tab"]', 'Products').click();

    cy.contains('[role="tab"]', 'Products').should('have.attr', 'aria-selected', 'true');
    cy.get('[role="tabpanel"]').should('have.attr', 'id', 'products-panel').and('contain.text', 'products content');

    cy.get('button[aria-label="Expand sidebar"]').click();
    cy.get('button[aria-label="Expand sidebar"]').should('not.exist');
  });
});
