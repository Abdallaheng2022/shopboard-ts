# ShopBoard

## Stack

- Vite, TypeScript with "strict": true
- Vanilla DOM, no framework
- Semantic HTML, CSS custom properties in src/style.css
- Prettier, ESLint, husky and lint-staged

## Structure

- `index.html`: the page
- `src/style.css`: all styles and the design tokens
- `src/main.ts`: entry point only. It loads the products and connects the modules.
- `src/modules/<feature>/`: one folder per feature, split into
  `<feature>.types.ts`, `.api.ts`, `.logic.ts`, `.state.ts` and `.ui.ts` as needed.
- `src/shared/api/client.ts`: the only file that calls `fetch`
- `src/shared/api/errors.ts`: `ApiError` and the user message for every error
- `src/shared/ui/`: DOM helpers, price formatting, toasts, the connection
  watcher and the global error handlers
- A new feature goes in a new folder in `src/modules/`.
- Code used by more than one feature goes in `src/shared/`.

Current modules:

- `products`: types, API, search/filter/sort logic, rendering
- `cart`: types, state with localStorage, count and total, rendering
- `register`: the sign-up dialog

## Commands

- `npm run dev`: start the dev server
- `npm run typecheck`: check the types
- `npm run lint`: run ESLint
- `npm run format`: format every file
- `npm run build`: build for production

## Rules

- Never use `as`, like in cart.state.ts, products.api.ts, cart.ui.ts
  and products.ui.ts. A type guard makes TypeScript check the types,
  so errors are not skipped. Use a type guard with `is` instead.
- Delete `npm test` from `.husky/pre-commit` and keep only
  `npx lint-staged`, so the commit can go through.
- Delete files that are no longer used, and keep the docs in sync.
- Only `*.ui.ts` files and `shared/ui/` touch the DOM.
  `*.logic.ts` files take the data and return it.
- The cart shows every product line by line with its details and quantity.
  The user can add more than one of a product, up to what the store has.
  When the quantity reaches zero, the product is removed from the cart.
  A product that is out of stock can't be added.

### Errors, loading and empty states

- Every request goes through `getJson` in `shared/api/client.ts`. Never call
  `fetch` anywhere else.
- `getJson` throws only `ApiError`, with a kind: `offline`, `network`,
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
- Every listener is added once, in `main.ts`. A retry reloads the data; it
  never adds listeners again.

## Before you finish

- Run `npm run typecheck` and `npm run lint`. Both must pass.
- Write all code, comments and commit messages in English.
