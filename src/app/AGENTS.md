# `src/app`

This folder owns the Next.js App Router shell.

## What belongs here

- Route files such as `page.tsx`, `layout.tsx`, `error.tsx`, `global-error.tsx`
- `providers.tsx`
- `globals.css`
- Route-local wrapper styles
- App-wide bootstrap/composition such as `AppWarmup`
- Metadata and branding helpers used by the app shell

## What does not belong here

- Business components like `ProductList`, `LoginForm`, `OrdersTable`
- Entity-specific selectors or query hooks
- API request code

## Structure rules

- Keep route segments lowercase because they map to URLs.
- Keep files here thin and compositional.
- If a route needs business UI, import it from `src/features`.
- If a route needs generic UI, import it from `src/components`.
- Before changing Next.js-specific patterns, read the relevant file-convention docs in `node_modules/next/dist/docs/`.
