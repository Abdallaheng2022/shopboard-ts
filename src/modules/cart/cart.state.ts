// cart.state.ts: holds the current cart and keeps it in localStorage. The only file that changes the cart.
import type { Cart, CartItem } from "./cart.types";

// The localStorage key the cart is saved under.
const CART_STORAGE_KEY = "shopboard-cart";

// How much one click on + or - changes a quantity.
const QUANTITY_STEP = 1;

// The smallest quantity a line can have. Below this, the line is removed.
const MIN_QUANTITY = 1;

// Checks that a value read from localStorage really looks like a cart line.
function isCartItem(value: unknown): value is CartItem {
  return (
    typeof value === "object" &&
    value !== null &&
    "productId" in value &&
    Number.isInteger(value.productId) &&
    "quantity" in value &&
    typeof value.quantity === "number" &&
    Number.isInteger(value.quantity) &&
    value.quantity >= MIN_QUANTITY
  );
}

// Reads the saved cart. Missing, broken or blocked storage gives an empty cart instead of an error.
function loadCart(): Cart {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved === null) return [];
    const data: unknown = JSON.parse(saved);
    return Array.isArray(data) ? data.filter(isCartItem) : [];
  } catch (error) {
    console.warn("Couldn't read the saved cart", error);
    return [];
  }
}

// The current cart. Not exported: other files read it with getCart() and change it with the functions below.
let cart: Cart = loadCart();

// True when the last save failed, for example when storage is full or blocked.
let saveFailed = false;

// Replaces the cart and saves it, so it survives a page refresh.
// If saving fails, the cart still works for this visit; saveFailed tells the UI.
function setCart(next: Cart): Cart {
  cart = next;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    saveFailed = false;
  } catch (error) {
    console.warn("Couldn't save the cart", error);
    saveFailed = true;
  }
  return cart;
}

// Tells the UI whether the last change could not be saved.
export function didLastSaveFail(): boolean {
  return saveFailed;
}

// Changes one product's quantity by `step`, and drops the line if it falls below the minimum.
function changeQuantity(productId: number, step: number): Cart {
  const next = cart
    .map((item) =>
      item.productId === productId ? { ...item, quantity: item.quantity + step } : item,
    )
    .filter((item) => item.quantity >= MIN_QUANTITY);
  return setCart(next);
}

// Returns the current cart.
export function getCart(): Cart {
  return cart;
}

// Adds one of a product. If it's already in the cart, its quantity goes up instead of adding a new line.
export function addItem(productId: number): Cart {
  const isInCart = cart.some((item) => item.productId === productId);
  if (isInCart) return changeQuantity(productId, QUANTITY_STEP);
  return setCart([...cart, { productId, quantity: QUANTITY_STEP }]);
}

// Adds one more of a product that is already in the cart.
export function increaseItem(productId: number): Cart {
  return changeQuantity(productId, QUANTITY_STEP);
}

// Takes one away. A quantity of 1 removes the product, so it never shows 0 or less.
export function decreaseItem(productId: number): Cart {
  return changeQuantity(productId, -QUANTITY_STEP);
}

// Removes only this product. Every other line stays.
export function removeItem(productId: number): Cart {
  return setCart(cart.filter((item) => item.productId !== productId));
}

// Drops saved lines for products the store no longer has, so the count matches what is shown.
export function removeUnknownItems(knownIds: readonly number[]): Cart {
  const next = cart.filter((item) => knownIds.includes(item.productId));
  return next.length === cart.length ? cart : setCart(next);
}

// Empties the whole cart.
export function clearCart(): Cart {
  return setCart([]);
}
