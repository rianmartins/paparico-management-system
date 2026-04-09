# `src/hooks`

This folder contains shared reusable hooks.

## What belongs here

- Hooks reused by multiple features or components
- Cross-cutting hooks that are not tied to one entity screen

## What does not belong here

- Hooks only used by a single feature folder
- App-route composition logic

## Structure rules

- Keep hook APIs small and explicit.
- If a hook becomes feature-specific, move it into that feature folder.
- Shared hooks may depend on `components`, `types`, and other generic utilities, but should avoid depending on feature modules unless there is a strong reason.
