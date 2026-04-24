# `src` Overview

This folder is organized by architectural responsibility, not by technology alone.

## Subfolder roles

- `app`: App Router shell and route composition only.
- `api`: Raw backend request classes.
- `components`: Shared, business-agnostic UI.
- `features`: Business-facing UI components that observe stores and delegate to them.
- `store`: Observable domain state, loading flags, and mutation actions (MobX).
- `services`: Entity-level orchestration and reusable transformations.
- `types`: Shared reusable type definitions.
- `hooks`: Shared reusable hooks.
- `test`: Test helpers and test-only utilities.

## Rules

- Choose the narrowest folder that owns the behavior.
- Prefer moving code to the correct layer instead of adding cross-layer shortcuts.
- Keep import boundaries clean:
  - `app` can compose features/components/providers/stores.
  - `features` can use components, stores, services, hooks, types, and APIs when needed.
  - `store` can use APIs, services, and types.
  - `services` can use APIs and types.
  - `components` should avoid depending on features, stores, or services.
