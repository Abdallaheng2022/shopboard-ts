# ShopBoard

## Stack

- Vite, TypeScript with "strict": true
- Vanilla DOM, no framework
- Semantic HTML, CSS custom properties in src/style.css
- Prettier, ESLint, husky and lint-staged

## Structure

- `index.html`: the page
- `src/style.css`: the design tokens first, then the styles for each component.
  DESIGN.md explains every token.
- `public/`: static files served as they are (the favicon)
- `src/main.ts`: entry point only. It sets up the app-wide handlers
  (`setupGlobalErrorHandlers`, `setupConnectionWatcher`) and then calls ONE function
  per module. Nothing else goes here:

  ```ts
  const products = initProducts();
  initCart(products);
  initRegister();
  ```

- `src/modules/<feature>/`: one folder per feature, self-contained, split into
  `<feature>.types.ts`, `.api.ts`, `.logic.ts`, `.state.ts` and `.ui.ts` as needed.
- `src/modules/<feature>/index.ts`: the module's ONLY public entry. It exports one
  `init<Feature>()` function, plus the types and the small interface other modules
  are allowed to use. The init function owns the module's state, adds all of its
  listeners, and starts its requests.
- `src/shared/api/client.ts`: the only file that calls `fetch`. Holds `API_BASE_URL`
  and `createApiClient(subpath)`.
- `src/shared/api/errors.ts`: `ApiError` and the user message for every error
- `src/shared/ui/`: DOM helpers, price formatting, toasts, the connection
  watcher (`setupConnectionWatcher`, `onBackOnline`) and the global error handlers
- A new feature goes in a new folder in `src/modules/`, with its own `index.ts`,
  and gets one `init<Feature>()` call in `main.ts`.
- Code used by more than one feature goes in `src/shared/`.

### Modules and how they relate

| Module     | Entry                | Depends on                   | Exposes                                                                           |
| ---------- | -------------------- | ---------------------------- | --------------------------------------------------------------------------------- |
| `products` | `initProducts()`     | nothing                      | `ProductsModule`: `getAll`, `findById`, `onLoaded`, `onAddToCart`; type `Product` |
| `cart`     | `initCart(products)` | `ProductsModule` (passed in) | nothing                                                                           |
| `register` | `initRegister()`     | nothing                      | nothing                                                                           |

- `products` loads, filters and draws the products. It retries the load itself when
  the connection returns (`onBackOnline`). `onAddToCart` only fires for products
  that exist and are in stock.
- `cart` keeps the cart in localStorage and draws the drawer. It looks products up
  with `products.findById`, adds a line on `products.onAddToCart`, and drops saved
  lines for unknown products on `products.onLoaded`.
- `register` is the sign-up dialog. It sends no request yet.
- A module imports another module ONLY through its `index.ts`
  (`import type { Product } from "../products"`), never from its inner files
  (`../products/products.logic`). A module that needs another one gets it as an
  argument of its init function, in `main.ts`.

## API

- `API_BASE_URL` in `src/shared/api/client.ts` is the only place the server URL is
  written: `https://shopboard-api.vercel.app/api`.
- Each module makes its own client for its subpath in its `<feature>.api.ts`, and
  never builds a full URL:

  ```ts
  const productsApi = createApiClient("/products");
  await productsApi.get(); // GET  {API_BASE_URL}/products
  await productsApi.get("/12"); // GET  {API_BASE_URL}/products/12
  await productsApi.get("", { q: "bag" }); // GET  {API_BASE_URL}/products?q=bag
  ```

- `ApiClient` has `get(path?, query?)`, `post(path, body)`, `put(path, body)`,
  `patch(path, body)` and `delete(path)`. Bodies are sent as JSON. Every method
  returns `Promise<unknown>`: the module checks it with a type guard and maps it to
  its own types in `<feature>.api.ts`.
- Every endpoint in use is listed here and in a comment at the top of its
  `<feature>.api.ts`. Add a row when a module starts using a new one.

| Module     | Subpath     | Method | Endpoint    | Function in `.api.ts` | Response                                                  |
| ---------- | ----------- | ------ | ----------- | --------------------- | --------------------------------------------------------- |
| `products` | `/products` | GET    | `/products` | `fetchProducts()`     | `{ items: ApiProduct[], total: number }`, prices in cents |
| `cart`     | none        |        |             |                       | The cart lives in localStorage only.                      |
| `register` | none        |        |             |                       | No sign-up endpoint is used yet.                          |

## Commands

- `npm run dev`: start the dev server
- `npm run typecheck`: check the types
- `npm run lint`: run ESLint
- `npm run format`: format every file
- `npm run build`: build for production

## Rules

### Mistakes I saw the AI make (do not repeat them)

1. **Hiding casts.** It wrote `as Product`, and later `querySelector<HTMLDialogElement>()`,
   which is the same unchecked cast in another form. Use a type guard with `is`, or
   `instanceof` (`getElement("#cart-drawer", HTMLDialogElement)`). No `as`, no `!`, no `any`.
2. **Adding steps that don't exist.** It put `npm test` in `.husky/pre-commit` when the
   project has no tests, so every commit failed. The hook runs only `npx lint-staged`.
   Never add a script, file or dependency the project doesn't use.
3. **Pasting styles on top instead of fixing them.** It added a generated theme layer with
   about 150 `!important` rules, ID selectors and a second set of color variables. It
   also caused a big empty gap under the products. In `style.css`: use the existing
   tokens, style with classes, no `!important` (except the reduced-motion rule), no new
   raw colors or sizes.
4. **Docs that don't match the code.** It described features that don't exist (a stock
   limit in the cart) and left wrong paths in the README. Change the docs in the same
   commit as the code, and only write what the code really does.
5. **Writing in other languages and about tools.** It left Arabic text and tool output in
   `DESIGN.md`. Everything in the repo is English and about this project.

### Code rules

- Only `*.ui.ts` files and `shared/ui/` touch the DOM.
  `*.logic.ts` files take data and return data.
- Delete files that are no longer used.
- The cart shows every product line by line with its details and quantity.
  The user can add more than one of a product. When the quantity reaches zero, the
  line is removed. A product that is out of stock can't be added or increased.

### Errors, loading and empty states

- Every request goes through `createApiClient(subpath)` (which uses `request`) in
  `shared/api/client.ts`. Never call `fetch` anywhere else, and never write the
  base URL in a module.
- `request` throws only `ApiError`, with a kind: `offline`, `network`,
  `timeout`, `http` or `invalid-response`. Every request has a timeout.
- Check every response before using it: `response.ok`, valid JSON, and a type
  guard for the data. Bad data is an `invalid-response` error, not a crash.
- The user never sees a raw error. Show `getErrorMessage(error)`, and send the
  technical details to `console.error`.
- Every screen that loads data has four states: loading, error with a
  "Try again" button, empty, and loaded. An empty store and a search with no
  results get different messages.
- Show an error once: in the page when it has a place there, otherwise as a
  toast. Never both.
- Wrap every `localStorage` call in try/catch. If saving fails, the cart still
  works for this visit and the user is told once.
- Never leave a promise floating. Use `await` inside try/catch, or `void`
  only when the function handles its own errors.
- Every listener is added once, inside the module's `init<Feature>()` function, and
  `main.ts` calls each init function exactly once. App-wide listeners
  (global errors, offline/online toasts) are set up once in `main.ts`. A retry
  reloads the data; it never adds listeners again.

## Before you finish

- Run `npm run typecheck` and `npm run lint`. Both must pass.
- Write all code, comments and commit messages in English.
