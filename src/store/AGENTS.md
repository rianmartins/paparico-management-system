# `src/store`

This folder owns observable business state and the operations that mutate it.

## What belongs here

- One store file per business domain: `ProductsStore.ts`, `OrdersStore.ts`
- All state that drives feature component rendering: server data, loading/error flags, filter values, UI open/close state, in-progress operation tracking
- All methods that load, create, update, or delete domain data
- Computed derivations over that state (formatted rows, filtered lists, derived flags)

## What does not belong here

- UI rendering — stores are plain classes, not components
- Raw HTTP calls — delegate to `src/api`
- Data transformation and selectors — delegate to `src/services`
- Form state (validation, field values, field arrays) — keep in `react-hook-form`; stores own the submit action, not the form itself

## Structure rules

- One file per domain store.
- Export a default singleton instance, the same pattern used in `src/api` and `src/services`:
  ```ts
  class ProductsStore { ... }
  const productsStore = new ProductsStore();
  export default productsStore;
  ```
- Barrel-export all store instances from `src/store/index.ts`.
- Use `makeAutoObservable(this, {}, { autoBind: true })` in the constructor so all properties and methods are automatically tracked and `this` is always bound.

## MobX patterns

**Async actions must wrap state mutations in `runInAction`:**

```ts
async loadProducts() {
  runInAction(() => { this._isLoading = true; });
  try {
    const data = await productsService.loadProducts(...);
    runInAction(() => { this._data = data; this._isLoading = false; });
  } catch (error) {
    runInAction(() => { this._loadError = error; this._isLoading = false; });
  }
}
```

**Mutation actions reload state after the API call resolves:**

```ts
async createProduct(payload: CreateProductPayload) {
  await productsAPI.createProduct(payload);
  await this.loadProducts(); // re-fetches and updates observables
}
```

**Computed properties call service selectors — they do not duplicate transformation logic:**

```ts
get tableRows() {
  return this._data ? selectProductsTableRows(this._data) : [];
}
```

## Boundaries

- Stores may depend on `src/api`, `src/services`, and `src/types`.
- Stores must not import from `src/features`, `src/components`, or `src/app`.
- Feature components observe stores using `observer()` from `mobx-react-lite` and call store actions directly — no prop drilling of store instances.
