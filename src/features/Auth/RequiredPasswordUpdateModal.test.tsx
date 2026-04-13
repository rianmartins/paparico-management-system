import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useSyncExternalStore } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AuthAPI from '@/api/AuthAPI';
import { ApiError } from '@/api/errors';
import ToastProvider from '@/components/Toast/ToastProvider';

import RequiredPasswordUpdateModal from './RequiredPasswordUpdateModal';
import {
  clearStoredSession,
  getStoredSession,
  persistSession,
  requiresPasswordUpdate,
  subscribeToStoredSession
} from './session';

vi.mock('@/api/AuthAPI', () => ({
  default: {
    updatePassword: vi.fn()
  }
}));

const mockedUpdatePassword = vi.mocked(AuthAPI.updatePassword);

function RequiredPasswordUpdateHarness() {
  const isOpen = useSyncExternalStore(subscribeToStoredSession, requiresPasswordUpdate, () => false);

  return <RequiredPasswordUpdateModal isOpen={isOpen} />;
}

function renderRequiredPasswordUpdateModal() {
  persistSession({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    requirePasswordUpdate: true
  });

  return render(
    <ToastProvider>
      <RequiredPasswordUpdateHarness />
    </ToastProvider>
  );
}

function fillPasswordForm({
  confirmation = 'new-secret',
  currentPassword = 'current-secret',
  newPassword = 'new-secret'
}: {
  confirmation?: string;
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
  fireEvent.change(screen.getByLabelText('Confirm new password'), {
    target: {
      value: confirmation
    }
  });
}

describe('RequiredPasswordUpdateModal', () => {
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
    mockedUpdatePassword.mockReset();
  });

  afterEach(() => {
    HTMLDialogElement.prototype.showModal = originalShowModal;
    HTMLDialogElement.prototype.close = originalClose;
  });

  it('opens as an undismissable modal when a password update is required', async () => {
    renderRequiredPasswordUpdateModal();

    const dialog = await screen.findByRole('dialog', { name: 'Update your password' });

    expect(dialog).toHaveAttribute('open');
    expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument();

    const cancelEvent = new Event('cancel', { cancelable: true });
    const wasCancelled = !dialog.dispatchEvent(cancelEvent);

    expect(wasCancelled).toBe(true);
    expect(dialog).toHaveAttribute('open');
  });

  it('validates the password rules before submitting', async () => {
    renderRequiredPasswordUpdateModal();

    fillPasswordForm({
      newPassword: 'short',
      confirmation: 'short'
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await screen.findByText('New password must be at least 6 characters.')).toBeInTheDocument();

    fillPasswordForm({
      newPassword: 'current-secret',
      confirmation: 'current-secret'
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await screen.findByText('New password must be different from your current password.')).toBeInTheDocument();

    fillPasswordForm({
      newPassword: 'new-secret',
      confirmation: 'other-secret'
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await screen.findByText('New password confirmation must match the new password.')).toBeInTheDocument();
    expect(mockedUpdatePassword).not.toHaveBeenCalled();
  });

  it('disables the submit button while the request is pending', async () => {
    mockedUpdatePassword.mockReturnValue(new Promise(() => undefined));
    renderRequiredPasswordUpdateModal();

    fillPasswordForm({});
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Updating password...' })).toBeDisabled();
    });
  });

  it('updates the password, shows a success toast, and closes the modal', async () => {
    mockedUpdatePassword.mockResolvedValue(undefined);
    const { container } = renderRequiredPasswordUpdateModal();

    fillPasswordForm({});
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    await waitFor(() => {
      expect(mockedUpdatePassword).toHaveBeenCalledWith({
        currentPassword: 'current-secret',
        newPassword: 'new-secret'
      });
    });

    expect(await screen.findByText('Your password has been updated.')).toBeInTheDocument();
    await waitFor(() => {
      expect(getStoredSession()?.requirePasswordUpdate).toBe(false);
      expect(container.querySelector('dialog')).not.toHaveAttribute('open');
    });
  });

  it('shows an error toast and keeps the modal open when the request fails', async () => {
    mockedUpdatePassword.mockRejectedValue(
      new ApiError({
        status: 401,
        code: 'INVALID_CURRENT_PASSWORD',
        message: 'Current password is incorrect.'
      })
    );
    renderRequiredPasswordUpdateModal();

    fillPasswordForm({});
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await screen.findByText('Unable to update password')).toBeInTheDocument();
    expect(screen.getAllByText('Current password is incorrect.').length).toBeGreaterThan(0);
    expect(screen.getByRole('dialog', { name: 'Update your password' })).toHaveAttribute('open');
    expect(getStoredSession()?.requirePasswordUpdate).toBe(true);
  });
});
