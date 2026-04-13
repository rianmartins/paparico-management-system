import { ServerError } from '@/api/errors';
import { getAxiosClient } from '@/api/axiosClient';
import { clearStoredSession, getStoredSession, persistSession } from '@/features/Auth/session';
import type { AuthSession, LoginCredentials, LoginResponsePayload } from '@/types/Auth';

function extractSession(payload: LoginResponsePayload): AuthSession {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    typeof payload.accessToken === 'string' &&
    payload.accessToken.trim().length > 0 &&
    typeof payload.refreshToken === 'string' &&
    payload.refreshToken.trim().length > 0
  ) {
    return {
      accessToken: payload.accessToken.trim(),
      refreshToken: payload.refreshToken.trim()
    };
  }

  throw new ServerError({
    status: 500,
    code: 'INVALID_AUTH_RESPONSE',
    message: 'The authentication service returned an invalid session.',
    raw: payload
  });
}

export class AuthAPI {
  async login(credentials: LoginCredentials) {
    const response = await getAxiosClient().post<LoginResponsePayload>('/auth/login', credentials);
    const session = extractSession(response.data);

    persistSession(session);

    return session;
  }

  async logout() {
    const session = getStoredSession();

    try {
      if (session?.refreshToken) {
        await getAxiosClient().post('/auth/logout', {
          refreshToken: session.refreshToken
        });
      }
    } catch {
      // Local sign-out should still succeed when the backend refresh token is invalid or already revoked.
    } finally {
      clearStoredSession();
    }
  }
}

const authAPI = new AuthAPI();

export default authAPI;
