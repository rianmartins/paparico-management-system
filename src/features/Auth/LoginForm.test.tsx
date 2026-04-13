import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthAPI from '@/api/AuthAPI';
import { ValidationError } from '@/api/errors';
import ToastProvider from '@/components/Toast/ToastProvider';

import LoginForm from './LoginForm';

const routerReplaceMock = vi.fn();
const routerRefreshMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: routerReplaceMock,
    refresh: routerRefreshMock
  })
}));

vi.mock('@/api/AuthAPI', () => ({
  default: {
    login: vi.fn()
  }
}));

const mockedLogin = vi.mocked(AuthAPI.login);

function renderLoginForm(redirectsTo?: string) {
  return render(
    <ToastProvider>
      <LoginForm redirectsTo={redirectsTo} />
    </ToastProvider>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    routerReplaceMock.mockReset();
    routerRefreshMock.mockReset();
    mockedLogin.mockReset();
  });

  it('validates required fields before submitting', async () => {
    renderLoginForm();

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it('submits credentials and redirects to the requested path', async () => {
    mockedLogin.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    });

    renderLoginForm('/products?tab=active');

    fireEvent.change(screen.getByLabelText('Email'), {
      target: {
        value: 'manager@paparico.pt'
      }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: {
        value: 'secret'
      }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({
        email: 'manager@paparico.pt',
        password: 'secret'
      });
    });

    expect(routerReplaceMock).toHaveBeenCalledWith('/products?tab=active');
    expect(routerRefreshMock).not.toHaveBeenCalled();
  });

  it('maps backend validation errors back into the form', async () => {
    mockedLogin.mockRejectedValue(
      new ValidationError({
        status: 422,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
        details: {
          email: ['This account could not be found.']
        }
      })
    );

    renderLoginForm();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: {
        value: 'manager@paparico.pt'
      }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: {
        value: 'secret'
      }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('This account could not be found.')).toBeInTheDocument();
    expect(routerReplaceMock).not.toHaveBeenCalled();
  });

  it('disables the submit button while the request is pending', async () => {
    mockedLogin.mockReturnValue(new Promise(() => undefined));

    renderLoginForm();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: {
        value: 'manager@paparico.pt'
      }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: {
        value: 'secret'
      }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
    });
  });
});
