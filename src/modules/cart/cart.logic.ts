// cart.logic.ts: counts and totals. No DOM and no localStorage here: data in, numbers out.
import { findProductById } from "../products/products.logic";
import type { Product } from "../products/products.types";
import type { Cart } from "./cart.types";

// Counts every item, so 2 tote bags + 1 watch = 3.
export function getItemCount(cart: Cart): number {
  return cart.reduce((count, item) => count + item.quantity, 0);
}

// Adds up price × quantity for every line. Lines for unknown products count as 0.
export function getTotal(cart: Cart, products: readonly Product[]): number {
  return cart.reduce((total, item) => {
    const product = findProductById(products, item.productId);
    return product === undefined ? total : total + product.price * item.quantity;
  }, 0);
}
