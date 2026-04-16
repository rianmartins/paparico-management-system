import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthAPI from '@/api/AuthAPI';
import { renderWithQueryClient } from '@/test/renderWithQueryClient';
import type { AuthUser } from '@/types/Auth';

import AppSidebar from './AppSidebar';

const usePathnameMock = vi.fn();
const routerReplaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
  useRouter: () => ({
    replace: routerReplaceMock
  })
}));

vi.mock('@/api/AuthAPI', () => ({
  default: {
    logout: vi.fn(),
    me: vi.fn()
  }
}));

const mockedMe = vi.mocked(AuthAPI.me);
const mockedLogout = vi.mocked(AuthAPI.logout);

const userFixture: AuthUser = {
  id: '1',
  email: 'manager@paparico.pt',
  roles: ['admin'],
  name: 'Paparico Manager',
  require_password_update: false
};

function renderAppSidebar(pathname = '/products') {
  usePathnameMock.mockReturnValue(pathname);

  return renderWithQueryClient(<AppSidebar />);
}

describe('AppSidebar', () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
    routerReplaceMock.mockReset();
    mockedMe.mockReset();
    mockedLogout.mockReset();
    mockedMe.mockResolvedValue(userFixture);
    mockedLogout.mockResolvedValue(undefined);
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

  it('renders the brand, current user and logout action in the sidebar', async () => {
    renderAppSidebar();

    expect(screen.getByText('Paparico')).toBeInTheDocument();
    expect(screen.getByText('Backoffice')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Paparico Manager')).toBeInTheDocument();
    });
    expect(screen.getByText('manager@paparico.pt')).toBeInTheDocument();
  });

  it('renders loading account labels while the current user is loading', () => {
    mockedMe.mockReturnValue(new Promise(() => undefined));

    renderAppSidebar();

    expect(screen.getByText('Loading user')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
