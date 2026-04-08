import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthGuard from '@/app/components/AuthGuard';
import { clearStoredSession, persistSession } from '@/auth/session';

const routerReplaceMock = vi.fn();
const usePathnameMock = vi.fn();
const useSearchParamsMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
  useRouter: () => ({
    replace: routerReplaceMock
  }),
  useSearchParams: () => useSearchParamsMock()
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
    useSearchParamsMock.mockReset();
  });

  it('redirects unauthenticated protected routes to login with redirects_to', async () => {
    usePathnameMock.mockReturnValue('/products');
    useSearchParamsMock.mockReturnValue(new URLSearchParams());

    renderGuard();

    await waitFor(() => {
      expect(routerReplaceMock).toHaveBeenCalledWith('/?redirects_to=%2Fproducts');
    });

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('redirects authenticated visits from login to the requested page', async () => {
    persistSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    });
    usePathnameMock.mockReturnValue('/');
    useSearchParamsMock.mockReturnValue(new URLSearchParams('redirects_to=%2Fproducts%3Ftab%3Dactive'));

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
    useSearchParamsMock.mockReturnValue(new URLSearchParams());

    renderGuard();

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(routerReplaceMock).not.toHaveBeenCalled();
  });
});
