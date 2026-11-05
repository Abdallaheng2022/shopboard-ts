# ShopBoard

A small online shop page built with TypeScript and Vite. Users can browse products, add them to a cart, change quantities and see the cart total.

## Features

- Products loaded from the ShopBoard API and validated before use
- Search by name, filter by category and sort by price
- Cart icon in the header with a badge that shows the number of items
- Cart drawer that slides in from the right and lists every product with its details
- Cart: add items, change quantity, remove items, clear the cart and see the total
- A quantity of zero removes the product, and out-of-stock products can't be added
- The cart is saved in localStorage, so it survives a page refresh
- Loading placeholders, empty states, and error messages with a "Try again" button
- Clear messages for offline, network, timeout, HTTP and invalid-data errors; products reload when the connection returns
- Toast notifications for cart actions
- Sign-up dialog that opens over the page, with native browser validation
- Mobile-first, responsive layout, with a dark theme that follows the system setting

## Tech stack

- [Vite](https://vite.dev/) for the dev server and build
- TypeScript with `"strict": true`
- Semantic HTML and CSS custom properties
- Prettier, ESLint, husky and lint-staged

## Getting started

Requirements: Node.js (LTS) and Git.

```bash
git clone https://github.com/Abdallaheng2022/shopboard-ts.git
cd shopboard-ts
npm install
npm run dev
```

## Scripts

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the development server              |
| `npm run build`        | Build the production version into `dist/` |
| `npm run typecheck`    | Check types with the TypeScript compiler  |
| `npm run lint`         | Run ESLint                                |
| `npm run format`       | Format all files with Prettier            |
| `npm run format:check` | Check formatting without changing files   |

## Project structure

```
shopboard-ts/
├── index.html                      # Page markup
├── public/favicon.svg              # Site icon
├── src/
│   ├── main.ts                     # Entry point: one init call per module
│   ├── style.css                   # Design tokens, then styles per component
│   ├── modules/
│   │   ├── products/
│   │   │   ├── index.ts            # Public entry: initProducts() and the ProductsModule API
│   │   │   ├── products.types.ts   # Product type
│   │   │   ├── products.api.ts     # GET /products through createApiClient, maps to Product
│   │   │   ├── products.logic.ts   # Search, category filter and price sort
│   │   │   └── products.ui.ts      # Renders the cards and the loading, empty and error states
│   │   ├── cart/
│   │   │   ├── index.ts            # Public entry: initCart(products)
│   │   │   ├── cart.types.ts       # CartItem and Cart types
│   │   │   ├── cart.state.ts       # The only file that changes the cart; saves it in localStorage safely
│   │   │   ├── cart.logic.ts       # Item count and total
│   │   │   └── cart.ui.ts          # Renders the cart drawer, opens and closes it
│   │   └── register/
│   │       ├── index.ts            # Public entry: initRegister()
│   │       └── register.ui.ts      # Opens and closes the sign-up dialog
│   └── shared/
│       ├── api/
│       │   ├── client.ts           # The only fetch: API_BASE_URL, createApiClient(subpath), timeout and checks
│       │   └── errors.ts           # ApiError and the user message for each error
│       └── ui/
│           ├── connection.ts       # Offline/online notices and onBackOnline()
│           ├── dom.ts              # Finds an element or throws a clear error
│           ├── format.ts           # Price formatting
│           ├── globalErrors.ts     # Catches any error nothing else caught
│           └── toast.ts            # Toast notifications
├── CLAUDE.md                       # Rules for AI coding tools
├── DESIGN.md                       # Design reference, tokens and decisions
├── eslint.config.js                # ESLint rules
├── .prettierrc                     # Prettier settings
└── .husky/pre-commit               # Runs lint-staged before every commit
```

### Where new code goes

- A new feature gets its own folder in `src/modules/<feature>/`, split into `types`, `api`, `logic`, `state` and `ui` files as needed, with an `index.ts` that exports one `init<Feature>()` function. `main.ts` calls it once.
- Modules only import each other through `index.ts`. A module that needs another one receives it as an argument of its init function.
- API requests use `createApiClient("/<subpath>")` from `src/shared/api/client.ts`, so the base URL lives in one place. The endpoints in use are listed in [CLAUDE.md](CLAUDE.md#api).
- Code used by more than one feature goes in `src/shared/`.
- `logic` and `state` files never touch the DOM. Only `ui` files do.

## Code quality

- TypeScript runs in strict mode. The code uses no `any`, no `as` and no `!` non-null assertions.
- A husky pre-commit hook runs lint-staged, which runs ESLint and Prettier on the staged files. The commit is blocked if ESLint finds an error that it cannot fix.

## Design

The design starts from the Bento grid style: rounded tiles, a bold heading font and one blue accent. The reference, the tokens, what I changed and the contrast checks are in [DESIGN.md](DESIGN.md).
