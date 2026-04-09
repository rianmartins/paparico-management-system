# `src/services`

This folder owns entity-level orchestration and reusable transformations.

## What belongs here

- One service folder per entity/domain, for example `ProductsService`
- Reusable selectors or mappers that multiple features can depend on
- Lightweight orchestration over the API layer

## Structure rules

- Keep the existing singleton class pattern for services:
  - class definition
  - default exported singleton instance
  - barrel exports from `index.ts`
- Service methods should be entity-oriented, for example `loadProducts`.
- Keep UI-only formatting out of services unless it is explicitly reused across multiple features.

## Boundaries

- Services may depend on `src/api` and `src/types`.
- Services should not render UI.
- Services should not depend on `src/app`.
