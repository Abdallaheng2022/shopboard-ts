// format.ts: turns numbers into text for the page. Used by products.ui.ts and cart.ui.ts.

// Shows prices as US dollars without cents, like "$89".
const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// Turns 89 into "$89".
export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}
