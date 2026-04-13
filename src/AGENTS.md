# `src` Overview

This folder is organized by architectural responsibility, not by technology alone.

## Subfolder roles

- `app`: App Router shell and route composition only.
- `api`: Raw backend request classes.
- `components`: Shared, business-agnostic UI.
- `features`: Business logic and feature-owned UI.
- `services`: Entity-level orchestration and reusable transformations.
- `types`: Shared reusable type definitions.
- `hooks`: Shared reusable hooks.
- `test`: Test helpers and test-only utilities.

## Rules

- Choose the narrowest folder that owns the behavior.
- Prefer moving code to the correct layer instead of adding cross-layer shortcuts.
- Keep import boundaries clean:
  - `app` can compose features/components/providers.
  - `features` can use components, services, hooks, types, and APIs when needed.
  - `services` can use APIs and types.
  - `components` should avoid depending on features or services.
