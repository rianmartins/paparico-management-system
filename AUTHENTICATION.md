# Authentication and Session Flow

This document explains the current frontend authentication process, where the code lives, and the rules to follow when changing it.

## Overview

The app uses a frontend-managed bearer-token session.

- The backend login response returns `accessToken`, `refreshToken`, and optional `user` metadata.
- The frontend stores only `accessToken`, `refreshToken`, and `requirePasswordUpdate` in `localStorage`.
- API requests send the access token as an `Authorization: Bearer ...` header.
- Current-user profile data comes from `/auth/me` through React Query, not from session storage.
- Route protection is optimistic and client-side. Backend endpoints must still enforce real authorization.

The current storage approach is a frontend-only compromise that matches the existing backend contract. A stronger future architecture would move session state to server-set `HttpOnly` cookies, which requires backend or Next route-handler support.

## Main Files

- `src/api/AuthAPI/AuthAPI.ts`: backend auth requests for login, current user, password update, and logout.
- `src/api/axiosClient.ts`: attaches bearer tokens and clears the stored session on unauthorized responses.
- `src/features/Auth/session/session.ts`: minimal browser session store.
- `src/features/Auth/redirects.ts`: safe redirect target parsing and login URL construction.
- `src/features/Auth/AuthGuard.tsx`: client-side protected-route behavior.
- `src/app/AppWarmup.tsx`: authenticated prefetch for current user and product data.
- `src/features/Auth/query.ts`: React Query current-user fetch.
- `src/features/Auth/LoginForm.tsx`, `LogoutButton.tsx`, and `RequiredPasswordUpdateModal.tsx`: auth UI flows.

## Stored Session Shape

The only persisted session data is:

```ts
type AuthSession = {
  accessToken: string;
  refreshToken: string;
  requirePasswordUpdate: boolean;
};
```

Do not store user profile fields in `localStorage`. Use `/auth/me` and React Query for user profile data.

`session.ts` intentionally keeps a small API:

- `getStoredSession()`
- `hasStoredSession()`
- `persistSession(session)`
- `clearStoredSession()`
- `markPasswordUpdateComplete()`
- `requiresPasswordUpdate()`
- `subscribeToStoredSession(onChange)`

Invalid token data makes the session unreadable. Missing or invalid `requirePasswordUpdate` defaults to `false` for compatibility with older stored sessions.

## Login Flow

1. `LoginForm` validates credentials with the auth schema.
2. `AuthAPI.login()` posts to `/auth/login`.
3. `AuthAPI` extracts only tokens and the top-level `requirePasswordUpdate` flag from the response.
4. `persistSession()` writes the minimal session to `localStorage` and emits the session-change event.
5. `LoginForm` redirects to the sanitized requested path or `/products`.
6. `AppWarmup` sees an authenticated session and prefetches `/auth/me` plus products.

## Request and Unauthorized Handling

`axiosClient` reads `getStoredSession()` before each request.

- If an access token exists, it sets `Authorization: Bearer ${accessToken}`.
- If a response normalizes to unauthorized, it clears the stored session by default.
- Requests can opt out with `skipUnauthorizedSessionClear`, currently used for password update so an incorrect current password does not sign the user out.

## Route Guard and Redirects

`AuthGuard` watches the session store with `useSyncExternalStore`.

- Unauthenticated users visiting protected routes are redirected to `/` with a safe `redirects_to` query parameter.
- Authenticated users visiting `/` are redirected to the sanitized `redirects_to` target or `/products`.
- Authenticated users with `requirePasswordUpdate` see the required password update modal on protected routes.

Redirect safety lives in `src/features/Auth/redirects.ts`.

- Internal paths are allowed.
- External URLs, protocol-relative URLs, malformed values, and `/api` routes are rejected.

## Current User Data

`useCurrentUserQuery()` fetches `/auth/me` and returns the backend user payload.

The current user is intentionally not persisted into the session. This keeps session storage focused on authentication state and lets React Query own user profile caching.

## Password Update

There are two password update entry points:

- `RequiredPasswordUpdateModal` for forced updates after login.
- `UpdatePasswordSection` in settings for voluntary updates.

Both call `AuthAPI.updatePassword()`. On success, they call `markPasswordUpdateComplete()`, which preserves tokens and clears only `requirePasswordUpdate`.

## Logout

`LogoutButton` calls `AuthAPI.logout()`.

`AuthAPI.logout()`:

1. Reads the stored refresh token.
2. Attempts backend logout with `/auth/logout`.
3. Always clears local session storage, even if the backend logout request fails.
4. Redirects the user to `/`.

## Testing Expectations

Auth changes should usually run:

```bash
npm run test:run
npm run test:component
npm run ts
npm run lint
```

Keep tests close to the owned code:

- Session storage behavior: `src/features/Auth/session/session.test.ts`.
- Redirect safety: `src/features/Auth/redirects.test.ts`.
- API request contracts: `src/api/AuthAPI/AuthAPI.test.ts` and `src/api/axiosClient.test.ts`.
- Route behavior: `src/features/Auth/AuthGuard.test.tsx`.
- Warmup behavior: `src/app/AppWarmup.test.tsx`.

## Future Improvement: HttpOnly Cookies

The modern, stronger direction is server-managed sessions with `HttpOnly`, `Secure`, `SameSite=Lax` cookies.

Do not partially mix that model into the current frontend token flow. A cookie migration should be planned as a larger change involving backend support or Next route handlers, updated request transport, route protection, logout semantics, and CSRF considerations if cookies authenticate cross-site requests.
