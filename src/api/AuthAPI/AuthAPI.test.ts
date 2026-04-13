import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthAPI from '@/api/AuthAPI';
import { getAxiosClient } from '@/api/axiosClient';
import { ValidationError } from '@/api/errors';
import { AUTH_SESSION_STORAGE_KEY } from '@/features/Auth/session';

vi.mock('@/api/axiosClient', () => ({
  getAxiosClient: vi.fn()
}));

const postMock = vi.fn();
const patchMock = vi.fn();
const mockedGetAxiosClient = vi.mocked(getAxiosClient);

describe('AuthAPI', () => {
  beforeEach(() => {
    postMock.mockReset();
    patchMock.mockReset();
    mockedGetAxiosClient.mockReset();
    mockedGetAxiosClient.mockReturnValue({
      patch: patchMock,
      post: postMock
    } as unknown as ReturnType<typeof getAxiosClient>);
    window.localStorage.clear();
  });

  it('stores the access, refresh, and required password update state after login', async () => {
    postMock.mockResolvedValue({
      data: {
        user: {
          id: '1',
          email: 'manager@paparico.pt',
          roles: ['admin'],
          require_password_update: true
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      }
    });

    await expect(
      AuthAPI.login({
        email: 'manager@paparico.pt',
        password: 'secret'
      })
    ).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: true
    });

    expect(postMock).toHaveBeenCalledWith('/auth/login', {
      email: 'manager@paparico.pt',
      password: 'secret'
    });
    expect(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBe(
      JSON.stringify({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        requirePasswordUpdate: true
      })
    );
  });

  it('defaults the required password update state to false when the login flag is missing', async () => {
    postMock.mockResolvedValue({
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      }
    });

    await expect(
      AuthAPI.login({
        email: 'manager@paparico.pt',
        password: 'secret'
      })
    ).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: false
    });
  });

  it('keeps the required password update state false when the login flag is false', async () => {
    postMock.mockResolvedValue({
      data: {
        user: {
          id: '1',
          email: 'manager@paparico.pt',
          roles: ['admin'],
          require_password_update: false
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      }
    });

    await expect(
      AuthAPI.login({
        email: 'manager@paparico.pt',
        password: 'secret'
      })
    ).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: false
    });
  });

  it('updates the authenticated user password', async () => {
    patchMock.mockResolvedValue({
      data: null
    });

    await expect(
      AuthAPI.updatePassword({
        currentPassword: 'current-secret',
        newPassword: 'new-secret'
      })
    ).resolves.toBeUndefined();

    expect(patchMock).toHaveBeenCalledWith(
      '/auth/password',
      {
        currentPassword: 'current-secret',
        newPassword: 'new-secret'
      },
      {
        skipUnauthorizedSessionClear: true
      }
    );
  });

  it('calls backend logout with the refresh token and clears storage', async () => {
    window.localStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify({
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      })
    );
    postMock.mockResolvedValue({
      data: null
    });

    await AuthAPI.logout();

    expect(postMock).toHaveBeenCalledWith('/auth/logout', {
      refreshToken: 'refresh-token'
    });
    expect(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
  });

  it('still clears storage when logout fails', async () => {
    window.localStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify({
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      })
    );
    postMock.mockRejectedValue(
      new ValidationError({
        status: 422,
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid refresh token.'
      })
    );

    await expect(AuthAPI.logout()).resolves.toBeUndefined();
    expect(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
  });
});
