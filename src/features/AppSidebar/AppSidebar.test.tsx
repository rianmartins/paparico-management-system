import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AppSidebar from './AppSidebar';

const usePathnameMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock()
}));

function renderAppSidebar(pathname = '/products') {
  usePathnameMock.mockReturnValue(pathname);

  return render(<AppSidebar />);
}

describe('AppSidebar', () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
  });

  it('renders the management sidebar navigation links', () => {
    renderAppSidebar();

    expect(screen.getByRole('complementary', { name: 'Management navigation' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Management sections' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  });

  it('marks Products as the current page on the products route', () => {
    renderAppSidebar('/products');

    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Settings' })).not.toHaveAttribute('aria-current');
  });

  it('marks Settings as the current page on the settings route', () => {
    renderAppSidebar('/settings');

    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Products' })).not.toHaveAttribute('aria-current');
  });

  it('does not mark a current page for unrelated routes', () => {
    renderAppSidebar('/orders');

    expect(screen.getByRole('link', { name: 'Products' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Settings' })).not.toHaveAttribute('aria-current');
  });
});
