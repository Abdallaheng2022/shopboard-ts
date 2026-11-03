// cart.types.ts: what the cart looks like.

// One line in the cart: which product, and how many of it.
export interface CartItem {
  readonly productId: number;
  readonly quantity: number;
}

// The whole cart. readonly: every change makes a NEW cart instead of editing the old one.
export type Cart = readonly CartItem[];

// The buttons on each cart line. Must match the data-action values made in cart.ui.ts.
export type CartAction = "increase" | "decrease" | "remove";
