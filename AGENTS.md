<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# App Structure

This project uses a strict separation of concerns. Keep code in the narrowest layer that owns the behavior.

## Folder ownership

- `src/app`
  Route files and app-shell composition only. This includes `layout`, `page`, `providers`, `globals.css`, `error`, `global-error`, route-local wrappers, and app bootstrapping such as `AppWarmup`.
- `src/api`
  Backend request layer only. Uses `axiosClient` and returns backend payloads. No UI logic here.
- `src/components`
  Shared, reusable UI components that are agnostic to business rules and entity-specific behavior.
- `src/features`
  Business-facing UI and feature logic. Example: `Products/ProductList`, `Auth/LoginForm`, auth session helpers, feature query hooks.
- `src/services`
  Entity-focused transformation and orchestration layer. Services may call APIs and expose reusable entity-level shaping/selectors for multiple features.
- `src/types`
  Shared types reused across folders. If a type is local to one component or one feature file, keep it local instead.
- `src/hooks`
  Shared hooks only.

## Naming rules

- Use PascalCase for non-route domain folders: `Auth`, `Products`, `ProductsAPI`, `ProductsService`.
- Use lowercase route segments inside `src/app`, because they map to URLs.
- Keep public entrypoints in `index.ts` files when a folder is meant to be imported as a module root.

## Placement rules

- Do not add business components under `src/app`.
- Do not put entity-specific logic into `src/components`.
- Do not put formatting/selectors into `src/api`.
- Do not create new top-level architecture buckets without explicit need.

## Class and module patterns

- API modules stay class-based singletons by default:
  - `export class ProductsAPI { ... }`
  - `const productsAPI = new ProductsAPI()`
  - `export default productsAPI`
- Service modules also stay class-based singletons by default:
  - `export class ProductsService { ... }`
  - `const productsService = new ProductsService()`
  - `export default productsService`
- Feature components should be colocated with their CSS, tests, and feature-only helpers.

## Testing

- Keep tests close to the owned code whenever possible.
- When changing architecture, update imports and barrels in the same change.
- Preserve the casing of tracked paths. Case-only rename drift can confuse TypeScript and git on macOS.
