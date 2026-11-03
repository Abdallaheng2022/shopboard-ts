// cart.ui.ts: draws the cart (lines, count, total) and listens to its buttons.
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

// Builds one cart line: name, price, - quantity +, and Remove.
function createCartLine(item: CartItem, product: Product): HTMLLIElement {
  const line = document.createElement("li");
  line.className = "cart-item";

  const details = document.createElement("div");
  const name = document.createElement("p");
  name.className = "cart-item-name";
  name.textContent = product.name;
  const price = document.createElement("p");
  price.className = "cart-item-price";
  price.textContent = `${formatPrice(product.price)} × ${item.quantity} = ${formatPrice(product.price * item.quantity)}`;
  details.append(name, price);

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
export function renderCart(cart: Cart, products: readonly Product[]): void {
  const lines = cart.flatMap((item) => {
    const product = findProductById(products, item.productId);
    return product === undefined ? [] : [createCartLine(item, product)];
  });
  list.replaceChildren(...lines);
  emptyMessage.hidden = cart.length > 0;
  clearButton.disabled = cart.length === 0;
  headerCount.textContent = String(getItemCount(cart));
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
