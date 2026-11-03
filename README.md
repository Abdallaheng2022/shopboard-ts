# ShopBoard

A small online shop page built with TypeScript and Vite. Users can browse products, add them to a cart, change quantities and see the cart total.

## Features

- Products loaded from the ShopBoard API and validated before use
- Search by name, filter by category and sort by price
- Cart: add items, change quantity, remove items, clear the cart and see the total
- The cart is saved in localStorage, so it survives a page refresh
- Toast notifications for cart actions
- Sign-up dialog that opens over the page, with native browser validation
- Mobile-first, responsive layout

## Tech stack

- [Vite](https://vite.dev/) for the dev server and build
- TypeScript with `"strict": true`
- Semantic HTML and CSS custom properties
- Prettier, ESLint, husky and lint-staged

## Getting started

Requirements: Node.js (LTS) and Git.

```bash
git clone https://github.com/Abdallaheng2022/shopboard-ts.git
cd shopboard
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
shopboard/
├── index.html                      # Page markup
├── src/
│   ├── main.ts                     # Entry point: wires the modules together
│   ├── style.css                   # Styles and design tokens
│   ├── modules/
│   │   ├── products/
│   │   │   ├── products.types.ts   # Product type
│   │   │   ├── products.api.ts     # Fetches products and maps them to Product
│   │   │   ├── products.logic.ts   # Search, category filter and price sort
│   │   │   └── products.ui.ts      # Renders the product cards
│   │   ├── cart/
│   │   │   ├── cart.types.ts       # CartItem and Cart types
│   │   │   ├── cart.state.ts       # The only file that changes the cart; saves it in localStorage
│   │   │   ├── cart.logic.ts       # Item count and total
│   │   │   └── cart.ui.ts          # Renders the cart and listens to its buttons
│   │   └── register/
│   │       └── register.ui.ts      # Opens and closes the sign-up dialog
│   └── shared/
│       ├── api/
│       │   └── client.ts           # Shared fetch helper
│       └── ui/
│           ├── dom.ts              # Finds an element or throws a clear error
│           ├── format.ts           # Price formatting
│           └── toast.ts            # Toast notifications
├── CLAUDE.md                       # Rules for AI coding tools
├── DESIGN.md                       # Design reference and tokens
├── eslint.config.js                # ESLint rules
├── .prettierrc                     # Prettier settings
└── .husky/pre-commit               # Runs lint-staged before every commit
```

### Where new code goes

- A new feature gets its own folder in `src/modules/<feature>/`, split into `types`, `api`, `logic`, `state` and `ui` files as needed.
- Code used by more than one feature goes in `src/shared/`.
- `logic` and `state` files never touch the DOM. Only `ui` files do.

## Code quality

- TypeScript runs in strict mode. The code uses no `any`, no `as` and no `!` non-null assertions.
- A husky pre-commit hook runs lint-staged, which runs ESLint and Prettier on the staged files. The commit is blocked if ESLint finds an error that it cannot fix.

## Design

The visual design, its reference and the design tokens are documented in [DESIGN.md](DESIGN.md).
