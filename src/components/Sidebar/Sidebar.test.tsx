import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Sidebar, { SidebarTab } from '@/components/Sidebar';

import styles from './Sidebar.module.css';

const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <span data-testid="overview-icon">O</span>,
    tooltip: 'See the overview'
  },
  {
    id: 'products',
    label: 'Products',
    icon: <span data-testid="products-icon">P</span>,
    panelId: 'products-panel'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <span data-testid="settings-icon">S</span>,
    disabled: true
  }
];

describe('Sidebar', () => {
  it('renders vertical tabs with labels, icons, and tooltip text', () => {
    render(<Sidebar ariaLabel="Main sections" onTabSelect={vi.fn()} selectedTabId="overview" tabs={tabs} />);

    const tabList = screen.getByRole('tablist', { name: 'Main sections' });
    const selectedTab = screen.getByRole('tab', { name: 'Overview' });
    const productsTab = screen.getByRole('tab', { name: 'Products' });

    expect(screen.queryByRole('button', { name: 'Expand sidebar' })).not.toBeInTheDocument();
    expect(tabList).toHaveAttribute('aria-orientation', 'vertical');
    expect(selectedTab).toHaveAttribute('aria-selected', 'true');
    expect(selectedTab.className).toContain(styles.selected);
    expect(selectedTab).toHaveAttribute('title', 'See the overview');
    expect(selectedTab).toHaveAttribute('data-tooltip', 'See the overview');
    expect(screen.getByTestId('overview-icon')).toBeInTheDocument();
    expect(productsTab).toHaveAttribute('aria-controls', 'products-panel');
    expect(productsTab).toHaveAttribute('aria-selected', 'false');
  });

  it('collapses to icon-only tabs with tooltip fallback text', () => {
    const { container } = render(
      <Sidebar ariaLabel="Main sections" onTabSelect={vi.fn()} selectedTabId="overview" tabs={tabs} />
    );

    const sidebar = container.firstElementChild;
    const overviewTab = screen.getByRole('tab', { name: 'Overview' });
    const productsTab = screen.getByRole('tab', { name: 'Products' });

    expect(sidebar?.className).not.toContain(styles.collapsed);
    expect(productsTab).not.toHaveAttribute('data-tooltip');

    fireEvent.click(overviewTab);

    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute('aria-expanded', 'false');
    expect(sidebar?.className).toContain(styles.collapsed);
    expect(overviewTab).toHaveAttribute('data-tooltip', 'See the overview');
    expect(productsTab).toHaveAttribute('data-tooltip', 'Products');
  });

  it('supports controlled collapsed state', () => {
    function SidebarHarness() {
      const [isCollapsed, setIsCollapsed] = useState(true);

      return (
        <Sidebar
          isCollapsed={isCollapsed}
          onCollapsedChange={setIsCollapsed}
          onTabSelect={vi.fn()}
          selectedTabId="overview"
          tabs={tabs}
        />
      );
    }

    render(<SidebarHarness />);

    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }));

    expect(screen.queryByRole('button', { name: 'Expand sidebar' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Overview' }));

    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls onTabSelect when a tab is selected', () => {
    const handleTabSelect = vi.fn();

    render(<Sidebar onTabSelect={handleTabSelect} selectedTabId="overview" tabs={tabs} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Products' }));

    expect(handleTabSelect).toHaveBeenCalledWith('products');
  });

  it('toggles collapsed state without selecting again when the active tab is clicked', () => {
    const handleTabSelect = vi.fn();
    const { container } = render(<Sidebar onTabSelect={handleTabSelect} selectedTabId="overview" tabs={tabs} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Overview' }));

    expect(handleTabSelect).not.toHaveBeenCalled();
    expect(container.firstElementChild?.className).toContain(styles.collapsed);
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  });

  it('does not call onTabSelect for disabled tabs', () => {
    const handleTabSelect = vi.fn();

    render(<Sidebar onTabSelect={handleTabSelect} selectedTabId="overview" tabs={tabs} />);

    const disabledTab = screen.getByRole('tab', { name: 'Settings' });

    expect(disabledTab).toBeDisabled();

    fireEvent.click(disabledTab);

    expect(handleTabSelect).not.toHaveBeenCalled();
  });

  it('moves selection with vertical tab keyboard controls', () => {
    function SidebarHarness() {
      const [selectedTabId, setSelectedTabId] = useState('overview');

      return <Sidebar onTabSelect={setSelectedTabId} selectedTabId={selectedTabId} tabs={tabs} />;
    }

    render(<SidebarHarness />);

    const tabList = screen.getByRole('tablist');
    const overviewTab = screen.getByRole('tab', { name: 'Overview' });
    const productsTab = screen.getByRole('tab', { name: 'Products' });

    overviewTab.focus();
    fireEvent.keyDown(tabList, { key: 'ArrowDown' });

    expect(productsTab).toHaveFocus();
    expect(productsTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tabList, { key: 'ArrowDown' });

    expect(overviewTab).toHaveFocus();
    expect(overviewTab).toHaveAttribute('aria-selected', 'true');
  });
});

describe('SidebarTab', () => {
  it('renders a granular tab with the selected state', () => {
    render(<SidebarTab icon={<span>H</span>} isSelected label="Home" tooltip="Go home" />);

    const tab = screen.getByRole('tab', { name: 'Home' });

    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(tab).toHaveAttribute('title', 'Go home');
    expect(tab.className).toContain(styles.SidebarTab);
    expect(tab.className).toContain(styles.selected);
  });
});
