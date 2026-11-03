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
- `src/shared/ui/`: DOM helpers, price formatting and toasts
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

## Before you finish

- Run `npm run typecheck` and `npm run lint`. Both must pass.
- Write all code, comments and commit messages in English.
