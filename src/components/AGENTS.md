# `src/components`

This folder is for shared UI that is not tied to a specific business domain.

## What belongs here

- Reusable primitives and compound UI components
- Generic form controls
- Shared feedback and layout pieces
- Generic error presentation such as `ErrorPage`

## What does not belong here

- Product-specific rendering rules
- Auth-specific business flows
- Entity selectors or query hooks

## Structure rules

- Each component should usually live in its own folder.
- Colocate component file, CSS module, tests, and local types/helpers.
- Export public pieces through the component folder `index.ts`.
- Keep props generic and reusable.
- If a component starts needing entity-specific assumptions, move that behavior to `src/features`.
