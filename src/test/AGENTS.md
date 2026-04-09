# `src/test`

This folder contains shared test helpers and test-only infrastructure.

## What belongs here

- Shared render helpers
- Shared mocked providers/clients
- Reusable test-only utilities such as error boundaries or fixtures when they are used broadly

## What does not belong here

- Production code
- Feature-specific tests that should live beside the owned feature/component

## Structure rules

- Keep helpers generic and reusable across the test suite.
- If a helper is only useful for one feature, colocate it with that feature instead.
- Do not import `src/test` code into production modules.
