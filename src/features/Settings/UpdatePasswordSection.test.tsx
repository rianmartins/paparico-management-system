import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthAPI from '@/api/AuthAPI';
import { ApiError } from '@/api/errors';
import ToastProvider from '@/components/Toast/ToastProvider';
import { clearStoredSession, getStoredSession, persistSession } from '@/features/Auth/session';

import UpdatePasswordSection from './UpdatePasswordSection';

vi.mock('@/api/AuthAPI', () => ({
  default: {
    updatePassword: vi.fn()
  }
}));

const mockedUpdatePassword = vi.mocked(AuthAPI.updatePassword);

function renderUpdatePasswordSection() {
  return render(
    <ToastProvider>
      <UpdatePasswordSection />
    </ToastProvider>
  );
}

function fillPasswordForm({
  currentPassword = 'current-secret',
  newPassword = 'new-secret'
}: {
  currentPassword?: string;
  newPassword?: string;
}) {
  fireEvent.change(screen.getByLabelText('Current password'), {
    target: {
      value: currentPassword
    }
  });
  fireEvent.change(screen.getByLabelText('New password'), {
    target: {
      value: newPassword
    }
  });
}

describe('UpdatePasswordSection', () => {
  beforeEach(() => {
    clearStoredSession();
    mockedUpdatePassword.mockReset();
  });

  it('validates the password rules before submitting', async () => {
    renderUpdatePasswordSection();

    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await screen.findByText('Current password is required.')).toBeInTheDocument();
    expect(screen.getByText('New password must be at least 6 characters.')).toBeInTheDocument();

    fillPasswordForm({
      currentPassword: 'current-secret',
      newPassword: 'current-secret'
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await screen.findByText('New password must be different from your current password.')).toBeInTheDocument();
    expect(mockedUpdatePassword).not.toHaveBeenCalled();
  });

  it('updates the password and clears the required password update flag', async () => {
    mockedUpdatePassword.mockResolvedValue(undefined);
    persistSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: true
    });
    renderUpdatePasswordSection();

    fillPasswordForm({});
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    await waitFor(() => {
      expect(mockedUpdatePassword).toHaveBeenCalledWith({
        currentPassword: 'current-secret',
        newPassword: 'new-secret'
      });
    });

    expect(await screen.findByText('Your password has been updated.')).toBeInTheDocument();
    expect(getStoredSession()).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: false
    });
  });

  it('shows an error toast when the request fails', async () => {
    mockedUpdatePassword.mockRejectedValue(
      new ApiError({
        status: 401,
        code: 'INVALID_CURRENT_PASSWORD',
        message: 'Current password is incorrect.'
      })
    );
    renderUpdatePasswordSection();

    fillPasswordForm({});
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await screen.findByText('Unable to update password')).toBeInTheDocument();
    expect(screen.getAllByText('Current password is incorrect.').length).toBeGreaterThan(0);
  });
});
