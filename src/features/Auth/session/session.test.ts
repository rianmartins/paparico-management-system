import { beforeEach, describe, expect, it } from 'vitest';

import {
  AUTH_SESSION_STORAGE_KEY,
  clearStoredSession,
  getLoginHref,
  getStoredSession,
  hasStoredSession,
  persistSession,
  sanitizeNextPath
} from './session';

describe('features/Auth/session', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists a session in local storage and reads it back', () => {
    persistSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    });

    expect(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBe(
      JSON.stringify({
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      })
    );
    expect(getStoredSession()).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    });
    expect(hasStoredSession()).toBe(true);
  });

  it('clears the stored session', () => {
    persistSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    });

    clearStoredSession();

    expect(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
    expect(getStoredSession()).toBeUndefined();
  });

  it('accepts internal page paths and preserves their query string', () => {
    expect(sanitizeNextPath('/products?tab=active')).toBe('/products?tab=active');
  });

  it('rejects malformed, external, and app-route redirect targets', () => {
    expect(sanitizeNextPath('https://example.com')).toBeUndefined();
    expect(sanitizeNextPath('//example.com')).toBeUndefined();
    expect(sanitizeNextPath('/api/products')).toBeUndefined();
  });

  it('builds a safe login href with the redirects_to parameter only for allowed paths', () => {
    expect(getLoginHref('/products?tab=active')).toBe('/?redirects_to=%2Fproducts%3Ftab%3Dactive');
    expect(getLoginHref('/api/products')).toBe('/');
  });
});
