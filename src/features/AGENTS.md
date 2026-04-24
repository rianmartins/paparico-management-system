# `src/features`

This folder owns business-facing UI. Feature components know about business domains — they are the bridge between stores and the screen.

## What belongs here

- Feature components such as `ProductList`, `LoginForm`, `LogoutButton`
- Business validation schemas (Zod)
- Session helpers or feature state tied to a business flow
- Feature-local UI helpers and form utilities

## What does not belong here

- Business logic, data loading, or mutation calls — those belong in `src/store`
- Generic, reusable UI primitives — those belong in `src/components`
- Entity-level data transformation — that belongs in `src/services`

## The key distinction: features vs. components

`src/features` components have business knowledge. They know what a "Product" is, they read from domain stores, and they call store actions. `src/components` components have no such knowledge — they are generic UI building blocks (`Table`, `Modal`, `Button`) that could be used in any project.

When a component needs to read from a store or call a domain operation, it belongs in `src/features`. When a component only accepts generic props and renders UI, it belongs in `src/components`.

## How feature components interact with stores

Feature components should be thin `observer` wrappers that read from a store and delegate all operations back to it. Business logic does not live in the component.

```tsx
// ✅ Correct — component reads state and delegates actions to the store
const ProductList = observer(function ProductList() {
  if (store.loadError && !isUnauthorizedApiError(store.loadError)) throw store.loadError;
  return <Table data={store.tableRows} isLoading={store.isLoading} ... />;
});

// ❌ Wrong — component owns a fetch call and manages its own loading state
function ProductList() {
  const [products, setProducts] = useState([]);
  useEffect(() => { fetchProducts().then(setProducts); }, []);
  ...
}
```

Form components are an exception: `react-hook-form` state (field values, validation errors, field arrays) stays inside the component. Only the submit handler and mutation calls go through the store.

## Structure rules

- Use one PascalCase folder per feature/domain: `Auth`, `Products`.
- Colocate feature UI, CSS, tests, and feature-only helpers.
- Expose the public feature surface from the feature `index.ts`.
- Keep feature internals private unless they are intentionally reused.
- Keep route composition out of feature files; route wiring stays in `src/app`.
