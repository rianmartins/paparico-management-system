import type { AuthSession } from '@/types/Auth';

export const AUTH_SESSION_STORAGE_KEY = 'paparico_auth_session';
const AUTH_SESSION_CHANGE_EVENT = 'paparico-auth-session-change';

type StoredAuthSessionPayload = Pick<AuthSession, 'accessToken' | 'refreshToken'> & {
  requirePasswordUpdate?: unknown;
};

function isBrowser() {
  return typeof window !== 'undefined';
}

function emitSessionChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT));
}

function isStoredAuthSessionPayload(value: unknown): value is StoredAuthSessionPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'accessToken' in value &&
    'refreshToken' in value &&
    typeof value.accessToken === 'string' &&
    value.accessToken.trim().length > 0 &&
    typeof value.refreshToken === 'string' &&
    value.refreshToken.trim().length > 0
  );
}

function normalizeStoredSession(session: StoredAuthSessionPayload): AuthSession {
  return {
    accessToken: session.accessToken.trim(),
    refreshToken: session.refreshToken.trim(),
    requirePasswordUpdate: session.requirePasswordUpdate === true
  };
}

export function getStoredSession() {
  if (!isBrowser()) {
    return undefined;
  }

  const value = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!value) {
    return undefined;
  }

  try {
    const parsedValue = JSON.parse(value);

    if (!isStoredAuthSessionPayload(parsedValue)) {
      return undefined;
    }

    return normalizeStoredSession(parsedValue);
  } catch {
    return undefined;
  }
}

export function hasStoredSession() {
  return getStoredSession() !== undefined;
}

export function requiresPasswordUpdate() {
  return getStoredSession()?.requirePasswordUpdate === true;
}

export function persistSession(session: AuthSession) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(normalizeStoredSession(session)));
  emitSessionChange();
}

export function clearStoredSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  emitSessionChange();
}

export function markPasswordUpdateComplete() {
  if (!isBrowser()) {
    return;
  }

  const session = getStoredSession();

  if (!session) {
    return;
  }

  window.localStorage.setItem(
    AUTH_SESSION_STORAGE_KEY,
    JSON.stringify({
      ...session,
      requirePasswordUpdate: false
    })
  );
  emitSessionChange();
}

export function subscribeToStoredSession(onChange: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleChange = () => {
    onChange();
  };

  window.addEventListener('storage', handleChange);
  window.addEventListener(AUTH_SESSION_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener('storage', handleChange);
    window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, handleChange);
  };
}
