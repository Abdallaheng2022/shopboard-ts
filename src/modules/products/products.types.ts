// products.types.ts: what a product looks like, and what the user can pick to search, filter and sort.

// One product in the shop.
export interface Product {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly price: number;
  readonly inStock: boolean;
}

// The three ways the list can be sorted. Must match the <option> values of #sort in index.html.
export type SortOrder = "default" | "price-asc" | "price-desc";

// Everything the user picked in the controls above the product grid.
export interface Filters {
  query: string;
  category: string;
  sort: SortOrder;
}
