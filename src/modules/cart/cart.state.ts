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

// Reads the saved cart. Missing or broken data gives an empty cart instead of an error.
function loadCart(): Cart {
  const saved = localStorage.getItem(CART_STORAGE_KEY);
  if (saved === null) return [];
  try {
    const data: unknown = JSON.parse(saved);
    return Array.isArray(data) ? data.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

// The current cart. Not exported: other files read it with getCart() and change it with the functions below.
let cart: Cart = loadCart();

// Replaces the cart and saves it, so it survives a page refresh.
function setCart(next: Cart): Cart {
  cart = next;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  return cart;
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

// Empties the whole cart.
export function clearCart(): Cart {
  return setCart([]);
}
