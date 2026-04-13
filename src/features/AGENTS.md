# `src/features`

This folder owns business-facing UI and feature logic.

## What belongs here

- Feature components such as `ProductList`, `LoginForm`, `LogoutButton`
- Feature query hooks and feature-local data access wrappers
- Business validation schemas
- Session helpers or feature state tied to a business flow

## Structure rules

- Use one PascalCase folder per feature/domain: `Auth`, `Products`.
- Colocate feature UI, CSS, tests, and feature-only helpers.
- Expose the public feature surface from the feature `index.ts`.
- Keep feature internals private unless they are intentionally reused.

## Feature boundaries

- Feature code may use shared `components`, `hooks`, `types`, and `services`.
- If logic is reusable across multiple features and is entity-centric, move it to `src/services`.
- If something is purely presentational and generic, move it to `src/components`.

## Component patterns

- Feature components may be client components when needed.
- Keep route composition out of feature files; route wiring stays in `src/app`.
- Keep feature-specific formatting close to the feature unless it becomes reusable across multiple features.
