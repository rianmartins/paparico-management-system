import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearStoredSession, persistSession } from './session';

import AuthGuard from './AuthGuard';

const routerReplaceMock = vi.fn();
const usePathnameMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
  useRouter: () => ({
    replace: routerReplaceMock
  })
}));

function renderGuard() {
  return render(
    <AuthGuard>
      <p>Protected content</p>
    </AuthGuard>
  );
}

describe('AuthGuard', () => {
  beforeEach(() => {
    clearStoredSession();
    routerReplaceMock.mockReset();
    usePathnameMock.mockReset();
    window.history.replaceState({}, '', '/');
  });

  it('redirects unauthenticated protected routes to login with redirects_to', async () => {
    usePathnameMock.mockReturnValue('/products');
    window.history.replaceState({}, '', '/products');

    renderGuard();

    await waitFor(() => {
      expect(routerReplaceMock).toHaveBeenCalledWith('/?redirects_to=%2Fproducts');
    });

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('preserves the current query string when redirecting to login', async () => {
    usePathnameMock.mockReturnValue('/products');
    window.history.replaceState({}, '', '/products?tab=active');

    renderGuard();

    await waitFor(() => {
      expect(routerReplaceMock).toHaveBeenCalledWith('/?redirects_to=%2Fproducts%3Ftab%3Dactive');
    });
  });

  it('redirects authenticated visits from login to the requested page', async () => {
    persistSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    });
    usePathnameMock.mockReturnValue('/');
    window.history.replaceState({}, '', '/?redirects_to=%2Fproducts%3Ftab%3Dactive');

    renderGuard();

    await waitFor(() => {
      expect(routerReplaceMock).toHaveBeenCalledWith('/products?tab=active');
    });
  });

  it('renders protected content while the user is authenticated', () => {
    persistSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    });
    usePathnameMock.mockReturnValue('/products');
    window.history.replaceState({}, '', '/products');

    renderGuard();

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(routerReplaceMock).not.toHaveBeenCalled();
  });
});
