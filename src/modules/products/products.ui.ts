// products.ui.ts: draws the products and reads the search, category and sort controls.
import { getElement } from "../../shared/ui/dom";
import { formatPrice } from "../../shared/ui/format";
import { isSortOrder } from "./products.logic";
import type { Filters, Product } from "./products.types";

const grid = getElement<HTMLDivElement>("#product-grid");
const status = getElement<HTMLParagraphElement>("#products-status");
const searchInput = getElement<HTMLInputElement>("#search");
const categorySelect = getElement<HTMLSelectElement>("#category");
const sortSelect = getElement<HTMLSelectElement>("#sort");

// Adds one <option> per category after "All categories".
export function renderCategoryOptions(categories: readonly string[]): void {
  const options = categories.map((category) => new Option(category, category));
  categorySelect.append(...options);
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
  button.textContent = "Add to cart";
  button.dataset.productId = String(product.id);
  button.setAttribute("aria-label", `Add ${product.name} to cart`);

  card.append(name, category, price, button);
  return card;
}

// Replaces the grid with these products, and shows a message when there are none.
export function renderProducts(list: readonly Product[]): void {
  grid.replaceChildren(...list.map(createProductCard));
  status.hidden = list.length > 0;
  status.textContent = "No products match your search.";
}

// Shows an error in place of the products, for example when the server can't be reached.
export function renderProductsError(message: string): void {
  grid.replaceChildren();
  status.hidden = false;
  status.textContent = message;
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
