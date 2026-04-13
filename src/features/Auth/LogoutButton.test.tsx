import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthAPI from '@/api/AuthAPI';

import LogoutButton from './LogoutButton';

const routerReplaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: routerReplaceMock
  })
}));

vi.mock('@/api/AuthAPI', () => ({
  default: {
    logout: vi.fn()
  }
}));

const mockedLogout = vi.mocked(AuthAPI.logout);

describe('LogoutButton', () => {
  beforeEach(() => {
    mockedLogout.mockReset();
    routerReplaceMock.mockReset();
  });

  it('logs out and redirects back to the login page', async () => {
    mockedLogout.mockResolvedValue(undefined);

    render(<LogoutButton />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => {
      expect(mockedLogout).toHaveBeenCalledTimes(1);
    });

    expect(routerReplaceMock).toHaveBeenCalledWith('/');
  });

  it('shows a pending label while logout is in flight', async () => {
    mockedLogout.mockReturnValue(new Promise(() => undefined));

    render(<LogoutButton />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Signing out...' })).toBeDisabled();
    });
  });
});
