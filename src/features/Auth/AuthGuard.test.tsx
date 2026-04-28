import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ToastProvider from '@/components/Toast/ToastProvider';
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
    <ToastProvider>
      <AuthGuard>
        <p>Protected content</p>
      </AuthGuard>
    </ToastProvider>
  );
}

describe('AuthGuard', () => {
  const originalShowModal = HTMLDialogElement.prototype.showModal;
  const originalClose = HTMLDialogElement.prototype.close;

  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });

    HTMLDialogElement.prototype.close = vi.fn(function close(this: HTMLDialogElement) {
      this.removeAttribute('open');
    });

    clearStoredSession();
    routerReplaceMock.mockReset();
    usePathnameMock.mockReset();
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    HTMLDialogElement.prototype.showModal = originalShowModal;
    HTMLDialogElement.prototype.close = originalClose;
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

  it('protects the settings route for unauthenticated visits', async () => {
    usePathnameMock.mockReturnValue('/settings');
    window.history.replaceState({}, '', '/settings');

    renderGuard();

    await waitFor(() => {
      expect(routerReplaceMock).toHaveBeenCalledWith('/?redirects_to=%2Fsettings');
    });

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('redirects authenticated visits from login to the requested page', async () => {
    persistSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: false
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
      refreshToken: 'refresh-token',
      requirePasswordUpdate: false
    });
    usePathnameMock.mockReturnValue('/products');
    window.history.replaceState({}, '', '/products');

    renderGuard();

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(routerReplaceMock).not.toHaveBeenCalled();
  });

  it('renders the required password update modal while the authenticated session requires it', async () => {
    persistSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: true
    });
    usePathnameMock.mockReturnValue('/products');
    window.history.replaceState({}, '', '/products');

    renderGuard();

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(await screen.findByRole('dialog')).toHaveAttribute('open');
    expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument();
  });
});
