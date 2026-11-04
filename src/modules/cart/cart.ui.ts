// cart.ui.ts: draws the cart drawer (lines, count, total), opens and closes it, and listens to its buttons.
import { getElement } from "../../shared/ui/dom";
import { formatPrice } from "../../shared/ui/format";
import { findProductById } from "../products/products.logic";
import type { Product } from "../products/products.types";
import { getItemCount, getTotal } from "./cart.logic";
import type { Cart, CartAction, CartItem } from "./cart.types";

const list = getElement<HTMLUListElement>("#cart-list");
const emptyMessage = getElement<HTMLParagraphElement>("#cart-empty");
const headerCount = getElement<HTMLSpanElement>("#cart-count");
const totalText = getElement<HTMLSpanElement>("#cart-total");
const clearButton = getElement<HTMLButtonElement>("#clear-cart");
const drawer = getElement<HTMLDialogElement>("#cart-drawer");
const openButton = getElement<HTMLButtonElement>("#open-cart");
const closeButton = getElement<HTMLButtonElement>("#close-cart");

// Makes one small button that says which action it does and for which product.
function createActionButton(
  action: CartAction,
  productId: number,
  text: string,
  label: string,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button-secondary";
  button.textContent = text;
  button.dataset.action = action;
  button.dataset.productId = String(productId);
  button.setAttribute("aria-label", label);
  return button;
}

// Builds one cart line: name, category, price, - quantity +, and Remove.
function createCartLine(item: CartItem, product: Product): HTMLLIElement {
  const line = document.createElement("li");
  line.className = "cart-item";

  const details = document.createElement("div");
  const name = document.createElement("p");
  name.className = "cart-item-name";
  name.textContent = product.name;
  const category = document.createElement("p");
  category.className = "cart-item-category";
  category.textContent = product.category;
  const price = document.createElement("p");
  price.className = "cart-item-price";
  price.textContent = `${formatPrice(product.price)} × ${item.quantity} = ${formatPrice(product.price * item.quantity)}`;
  details.append(name, category, price);

  const quantity = document.createElement("span");
  quantity.className = "quantity";
  quantity.textContent = String(item.quantity);

  const actions = document.createElement("div");
  actions.className = "cart-item-actions";
  actions.append(
    createActionButton("decrease", product.id, "−", `Decrease quantity of ${product.name}`),
    quantity,
    createActionButton("increase", product.id, "+", `Increase quantity of ${product.name}`),
    createActionButton("remove", product.id, "Remove", `Remove ${product.name} from cart`),
  );

  line.append(details, actions);
  return line;
}

// Redraws the whole cart: every line, the count in the header, and the total.
// Before the products load, saved lines can't be drawn yet, so a message says so.
export function renderCart(cart: Cart, products: readonly Product[]): void {
  const lines = cart.flatMap((item) => {
    const product = findProductById(products, item.productId);
    return product === undefined ? [] : [createCartLine(item, product)];
  });
  list.replaceChildren(...lines);
  if (cart.length === 0) {
    emptyMessage.textContent = "Your cart is empty.";
    emptyMessage.hidden = false;
  } else if (lines.length === 0) {
    emptyMessage.textContent = "Your cart will show here once the products load.";
    emptyMessage.hidden = false;
  } else {
    emptyMessage.hidden = true;
  }
  clearButton.disabled = cart.length === 0;
  const itemCount = getItemCount(cart);
  headerCount.textContent = String(itemCount);
  openButton.setAttribute("aria-label", `Open cart, ${itemCount} items`);
  totalText.textContent = formatPrice(getTotal(cart, products));
}

// Checks that a data-action value is one of the cart actions.
function isCartAction(value: string | undefined): value is CartAction {
  return value === "increase" || value === "decrease" || value === "remove";
}

// Calls the handler when +, - or Remove is clicked on any line.
// One listener on the list for all buttons, so redrawing never adds extra listeners.
export function onCartAction(handler: (action: CartAction, productId: number) => void): void {
  list.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>("button[data-action]");
    if (button === null) return;
    const action = button.dataset.action;
    if (!isCartAction(action)) return;
    handler(action, Number(button.dataset.productId));
  });
}

// Calls the handler when "Clear cart" is clicked.
export function onClearCart(handler: () => void): void {
  clearButton.addEventListener("click", handler);
}

// Opens the cart drawer over the page.
export function openCart(): void {
  if (!drawer.open) drawer.showModal();
}

// Connects the cart icon, the close button and the backdrop to the drawer.
export function setupCartDrawer(): void {
  openButton.addEventListener("click", openCart);
  closeButton.addEventListener("click", () => drawer.close());

  // A click on the dark backdrop lands on the dialog itself, not on its content.
  drawer.addEventListener("click", (event) => {
    if (event.target === drawer) drawer.close();
  });
}
