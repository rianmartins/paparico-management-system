# `src/types`

This folder is for shared types reused across multiple folders.

## What belongs here

- Shared API contracts
- Shared entity types
- Shared cross-layer payload/input types

## What does not belong here

- One-off component prop types used in a single file
- Local implementation-only helper types that are not reused

## Structure rules

- Use one folder per shared domain when it improves discoverability: `Auth`, `Products`, `ErrorPage`.
- Keep names explicit and stable.
- When a type is referenced by `api`, `features`, and `services`, it belongs here.
