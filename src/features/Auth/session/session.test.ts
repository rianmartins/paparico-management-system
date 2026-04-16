import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AUTH_SESSION_STORAGE_KEY,
  clearStoredSession,
  getStoredSession,
  hasStoredSession,
  markPasswordUpdateComplete,
  persistSession,
  requiresPasswordUpdate,
  subscribeToStoredSession
} from './session';

describe('features/Auth/session', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists a session in local storage and reads it back', () => {
    persistSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: true
    });

    expect(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBe(
      JSON.stringify({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        requirePasswordUpdate: true
      })
    );
    expect(getStoredSession()).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: true
    });
    expect(hasStoredSession()).toBe(true);
    expect(requiresPasswordUpdate()).toBe(true);
  });

  it('defaults older stored sessions to no required password update', () => {
    window.localStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify({
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      })
    );

    expect(getStoredSession()).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: false
    });
    expect(requiresPasswordUpdate()).toBe(false);
  });

  it('returns undefined for malformed stored sessions', () => {
    window.localStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify({
        accessToken: '',
        refreshToken: 'refresh-token',
        requirePasswordUpdate: false
      })
    );

    expect(getStoredSession()).toBeUndefined();

    window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, '{');

    expect(getStoredSession()).toBeUndefined();
  });

  it('marks the required password update as complete', () => {
    persistSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: true
    });

    markPasswordUpdateComplete();

    expect(getStoredSession()).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: false
    });
    expect(requiresPasswordUpdate()).toBe(false);
  });

  it('notifies subscribers when the session changes', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToStoredSession(onChange);

    persistSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: true
    });
    markPasswordUpdateComplete();
    clearStoredSession();
    unsubscribe();
    persistSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: false
    });

    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('clears the stored session', () => {
    persistSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      requirePasswordUpdate: false
    });

    clearStoredSession();

    expect(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
    expect(getStoredSession()).toBeUndefined();
  });
});
