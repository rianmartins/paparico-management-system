# `src/api`

This folder is the backend request layer.

## What belongs here

- One API module per backend domain/entity, typically in `src/api/<Name>API`
- `axiosClient`
- API error normalization and transport-level helpers

## Structure rules

- API modules should stay request-only.
- Do not add UI formatting, selectors, or business presentation logic here.
- Prefer the existing singleton class pattern:
  - class with request methods
  - default exported singleton instance
  - barrel export from the folder root

## Method rules

- Methods should return backend payloads or normalized transport data.
- Keep method names action-oriented: `login`, `logout`, `listProducts`, `getOrder`, `updateProduct`.
- Use shared types from `src/types` for request/response contracts when they are reused outside the API layer.
