import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthAPI from '@/api/AuthAPI';
import { getAxiosClient } from '@/api/axiosClient';
import { ValidationError } from '@/api/errors';
import { AUTH_SESSION_STORAGE_KEY } from '@/features/Auth/session';

vi.mock('@/api/axiosClient', () => ({
  getAxiosClient: vi.fn()
}));

const postMock = vi.fn();
const mockedGetAxiosClient = vi.mocked(getAxiosClient);

describe('AuthAPI', () => {
  beforeEach(() => {
    postMock.mockReset();
    mockedGetAxiosClient.mockReset();
    mockedGetAxiosClient.mockReturnValue({
      post: postMock
    } as unknown as ReturnType<typeof getAxiosClient>);
    window.localStorage.clear();
  });

  it('stores the access and refresh tokens after login', async () => {
    postMock.mockResolvedValue({
      data: {
        user: {
          id: '1',
          email: 'manager@paparico.pt',
          roles: ['admin']
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
      refreshToken: 'refresh-token'
    });

    expect(postMock).toHaveBeenCalledWith('/auth/login', {
      email: 'manager@paparico.pt',
      password: 'secret'
    });
    expect(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBe(
      JSON.stringify({
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      })
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
