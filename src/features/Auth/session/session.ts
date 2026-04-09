import type { AuthSession } from '@/types/Auth';

export const AUTH_SESSION_STORAGE_KEY = 'paparico_auth_session';
const AUTH_SESSION_CHANGE_EVENT = 'paparico-auth-session-change';

const APP_ROUTE_PREFIXES = ['/api'];
const INTERNAL_ORIGIN = 'http://paparico.local';

function getSingleValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function isAppRoute(pathname: string) {
  return APP_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function emitSessionChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT));
}

function isAuthSession(value: unknown): value is AuthSession {
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

    if (!isAuthSession(parsedValue)) {
      return undefined;
    }

    return {
      accessToken: parsedValue.accessToken.trim(),
      refreshToken: parsedValue.refreshToken.trim()
    };
  } catch {
    return undefined;
  }
}

export function hasStoredSession() {
  return getStoredSession() !== undefined;
}

export function persistSession(session: AuthSession) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  emitSessionChange();
}

export function clearStoredSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
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

export function sanitizeNextPath(value?: string | string[]) {
  const candidate = getSingleValue(value);

  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return undefined;
  }

  try {
    const url = new URL(candidate, INTERNAL_ORIGIN);

    if (url.origin !== INTERNAL_ORIGIN || isAppRoute(url.pathname)) {
      return undefined;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return undefined;
  }
}

export function getLoginHref(nextPath?: string | string[]) {
  const sanitizedNextPath = sanitizeNextPath(nextPath);

  if (!sanitizedNextPath || sanitizedNextPath === '/') {
    return '/';
  }

  return `/?redirects_to=${encodeURIComponent(sanitizedNextPath)}`;
}
