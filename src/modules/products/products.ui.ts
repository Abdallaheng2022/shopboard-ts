// products.ui.ts: draws the products and reads the search, category and sort controls.
import { getElement } from "../../shared/ui/dom";
import { formatPrice } from "../../shared/ui/format";
import { ALL_CATEGORIES, isSortOrder } from "./products.logic";
import type { Filters, Product } from "./products.types";

const grid = getElement<HTMLDivElement>("#product-grid");
const status = getElement<HTMLDivElement>("#products-status");
const searchInput = getElement<HTMLInputElement>("#search");
const categorySelect = getElement<HTMLSelectElement>("#category");
const sortSelect = getElement<HTMLSelectElement>("#sort");

// How many placeholder cards show while the products load.
const SKELETON_COUNT = 6;

// Rebuilds the category list: "All categories" first, then one <option> per category.
export function renderCategoryOptions(categories: readonly string[]): void {
  const options = categories.map((category) => new Option(category, category));
  categorySelect.replaceChildren(new Option("All categories", ALL_CATEGORIES), ...options);
}

// Shows a message in the status box, with an optional button under it.
function showStatus(message: string, action?: HTMLButtonElement): void {
  const text = document.createElement("p");
  text.className = "hint";
  text.textContent = message;
  status.replaceChildren(text, ...(action === undefined ? [] : [action]));
  status.hidden = false;
}

// Turns the search, category and sort controls on or off.
function setControlsDisabled(disabled: boolean): void {
  searchInput.disabled = disabled;
  categorySelect.disabled = disabled;
  sortSelect.disabled = disabled;
}

// Builds one grey placeholder card. Screen readers skip it and hear the status message instead.
function createSkeletonCard(): HTMLDivElement {
  const card = document.createElement("div");
  card.className = "skeleton-card";
  card.setAttribute("aria-hidden", "true");
  return card;
}

// Loading state: placeholder cards, a status message, and the controls turned off.
export function renderProductsLoading(): void {
  grid.replaceChildren(...Array.from({ length: SKELETON_COUNT }, createSkeletonCard));
  grid.setAttribute("aria-busy", "true");
  setControlsDisabled(true);
  showStatus("Loading products…");
}

// Builds one product card, the same markup the old hard-coded HTML had.
function createProductCard(product: Product): HTMLElement {
  const card = document.createElement("article");
  card.className = "card";

  const name = document.createElement("h3");
  name.textContent = product.name;

  const category = document.createElement("p");
  category.className = "category";
  category.textContent = product.category;

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = formatPrice(product.price);

  const button = document.createElement("button");
  button.type = "button";
  button.dataset.productId = String(product.id);
  if (product.inStock) {
    button.textContent = "Add to cart";
    button.setAttribute("aria-label", `Add ${product.name} to cart`);
  } else {
    button.textContent = "Out of stock";
    button.disabled = true;
  }

  card.append(name, category, price, button);
  return card;
}

// Replaces the grid with these products. `totalCount` is how many the store has before filtering,
// so an empty store and a search with no results get different messages.
export function renderProducts(list: readonly Product[], totalCount: number): void {
  grid.replaceChildren(...list.map(createProductCard));
  grid.setAttribute("aria-busy", "false");
  setControlsDisabled(totalCount === 0);
  if (totalCount === 0) {
    showStatus("No products are available right now. Please check back later.");
  } else if (list.length === 0) {
    showStatus("No products match your search. Try another name or category.");
  } else {
    status.hidden = true;
  }
}

// Error state: the message and a "Try again" button that calls onRetry.
export function renderProductsError(message: string, onRetry: () => void): void {
  grid.replaceChildren();
  grid.setAttribute("aria-busy", "false");
  setControlsDisabled(true);
  const retryButton = document.createElement("button");
  retryButton.type = "button";
  retryButton.className = "button-secondary";
  retryButton.textContent = "Try again";
  retryButton.addEventListener("click", onRetry);
  showStatus(message, retryButton);
}

// Reads what the user picked in the three controls.
export function readFilters(): Filters {
  const sort = sortSelect.value;
  return {
    query: searchInput.value,
    category: categorySelect.value,
    sort: isSortOrder(sort) ? sort : "default",
  };
}

// Calls the handler every time the search text, category or sort changes.
export function onFiltersChange(handler: () => void): void {
  searchInput.addEventListener("input", handler);
  categorySelect.addEventListener("change", handler);
  sortSelect.addEventListener("change", handler);
}

// Calls the handler with the product id when an "Add to cart" button is clicked.
// One listener on the grid for all buttons, so redrawing the cards never adds extra listeners.
export function onAddToCart(handler: (productId: number) => void): void {
  grid.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>("button[data-product-id]");
    if (button === null) return;
    handler(Number(button.dataset.productId));
  });
}
