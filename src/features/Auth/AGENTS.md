# `src/features/Auth`

This feature owns auth-facing UI, client session state, auth redirects, and current-user query behavior.

## Current Auth Model

- The backend returns `accessToken`, `refreshToken`, and optional `user` metadata from login.
- The frontend persists only `accessToken`, `refreshToken`, and `requirePasswordUpdate`.
- Do not persist user profile data in `localStorage`; fetch it through `/auth/me` and React Query.
- API requests use `Authorization: Bearer ...` through `src/api/axiosClient.ts`.

## Placement Rules

- Keep browser session storage in `session/session.ts`.
- Keep redirect sanitization and login href construction in `redirects.ts`.
- Keep backend request methods in `src/api/AuthAPI`; do not move request logic into feature components.
- Keep route composition in `src/app`; feature components should not own app-shell wiring.
- Export intentional public Auth feature APIs from `index.ts`.

## Session Rules

- `AuthSession` is token state only: `accessToken`, `refreshToken`, and `requirePasswordUpdate`.
- `session.ts` should stay small and browser-only, with no user normalization or profile caching.
- `markPasswordUpdateComplete()` must preserve tokens and only clear `requirePasswordUpdate`.
- Invalid token storage should read as no session; missing password-update flags default to `false`.
- Session changes must emit through `subscribeToStoredSession` so `useSyncExternalStore` consumers update.

## Redirect Rules

- Sanitize all user-controlled redirect targets with `sanitizeNextPath`.
- Reject external URLs, protocol-relative URLs, malformed values, and `/api` routes.
- Keep login redirect URLs in the `redirects_to` query parameter.

## Testing Rules

- Update colocated tests with behavior changes.
- Session storage changes belong in `session/session.test.ts`.
- Redirect changes belong in `redirects.test.ts`.
- Route guard behavior belongs in `AuthGuard.test.tsx`.
- Login/logout/API contracts belong in `src/api/AuthAPI/AuthAPI.test.ts` and `src/api/axiosClient.test.ts`.

## Future Migration Note

The stronger long-term auth model is server-managed `HttpOnly` cookies. Do not mix cookie auth into this bearer-token flow piecemeal; plan it as a coordinated backend or route-handler migration.
