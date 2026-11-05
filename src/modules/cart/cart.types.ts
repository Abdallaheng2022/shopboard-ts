// cart.types.ts: what the cart looks like.
import type { Product } from "../products";

// How the cart looks up a product. index.ts passes the products module's findById.
export type FindProduct = (productId: number) => Product | undefined;

// One line in the cart: which product, and how many of it.
export interface CartItem {
  readonly productId: number;
  readonly quantity: number;
}

// The whole cart. readonly: every change makes a NEW cart instead of editing the old one.
export type Cart = readonly CartItem[];

// The buttons on each cart line. Must match the data-action values made in cart.ui.ts.
export type CartAction = "increase" | "decrease" | "remove";
