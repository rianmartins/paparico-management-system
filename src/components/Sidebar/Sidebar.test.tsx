import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Sidebar from '@/components/Sidebar';

import styles from './Sidebar.module.css';

describe('Sidebar', () => {
  it('renders children inside a complementary landmark with the provided label', () => {
    render(
      <Sidebar aria-label="Management navigation">
        <nav aria-label="Management sections">
          <a href="/products">Products</a>
        </nav>
      </Sidebar>
    );

    const sidebar = screen.getByRole('complementary', { name: 'Management navigation' });

    expect(sidebar.tagName).toBe('ASIDE');
    expect(sidebar.className).toContain(styles.Sidebar);
    expect(screen.getByRole('navigation', { name: 'Management sections' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products');
  });

  it('uses a default accessible label', () => {
    render(<Sidebar>Sidebar content</Sidebar>);

    expect(screen.getByRole('complementary', { name: 'Sidebar' })).toHaveTextContent('Sidebar content');
  });

  it('forwards native aside props', () => {
    render(
      <Sidebar className="custom-sidebar" data-testid="sidebar" id="main-sidebar">
        Content
      </Sidebar>
    );

    const sidebar = screen.getByTestId('sidebar');

    expect(sidebar).toHaveAttribute('id', 'main-sidebar');
    expect(sidebar.className).toContain(styles.Sidebar);
    expect(sidebar.className).toContain('custom-sidebar');
  });

  it('does not render tab or collapse controls', () => {
    render(
      <Sidebar>
        <a href="/settings">Settings</a>
      </Sidebar>
    );

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Expand sidebar' })).not.toBeInTheDocument();
  });
});
