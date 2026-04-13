import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it } from 'vitest';

import { axiosClient } from '@/api/axiosClient';
import { getStoredSession, persistSession } from '@/features/Auth/session';

const session = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  requirePasswordUpdate: true
};

const unauthorizedAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) =>
  Promise.reject({
    isAxiosError: true,
    message: 'Request failed with status code 401',
    config,
    response: {
      config,
      data: {
        code: 'INVALID_CURRENT_PASSWORD',
        message: 'Current password is incorrect.'
      },
      headers: {},
      status: 401,
      statusText: 'Unauthorized'
    },
    toJSON: () => ({ message: 'Request failed with status code 401' })
  });

describe('axiosClient', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('clears the stored session for unauthorized responses by default', async () => {
    persistSession(session);

    await expect(
      axiosClient.get('/products', {
        adapter: unauthorizedAdapter
      })
    ).rejects.toMatchObject({
      status: 401,
      message: 'Current password is incorrect.'
    });

    expect(getStoredSession()).toBeUndefined();
  });

  it('keeps the stored session when an unauthorized response opts out of session clearing', async () => {
    persistSession(session);

    await expect(
      axiosClient.patch(
        '/auth/password',
        {
          currentPassword: 'wrong-password',
          newPassword: 'new-secret'
        },
        {
          adapter: unauthorizedAdapter,
          skipUnauthorizedSessionClear: true
        }
      )
    ).rejects.toMatchObject({
      status: 401,
      message: 'Current password is incorrect.'
    });

    expect(getStoredSession()).toEqual(session);
  });
});
