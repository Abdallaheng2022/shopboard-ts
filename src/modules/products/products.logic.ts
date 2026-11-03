// products.logic.ts: search, filter and sort. No DOM and no fetch here: data in, data out.
import type { Filters, Product, SortOrder } from "./products.types";

// The value of the "All categories" option of #category in index.html.
export const ALL_CATEGORIES = "all";

// Checks that a string from the sort <select> is one of the allowed sort orders.
export function isSortOrder(value: string): value is SortOrder {
  return value === "default" || value === "price-asc" || value === "price-desc";
}

// Keeps the products whose name contains the query. Upper or lower case doesn't matter.
export function searchByName(list: readonly Product[], query: string): readonly Product[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery === "") return list;
  return list.filter((product) => product.name.toLowerCase().includes(normalizedQuery));
}

// Keeps the products in one category, or all of them when "all" is picked.
export function filterByCategory(list: readonly Product[], category: string): readonly Product[] {
  if (category === ALL_CATEGORIES) return list;
  return list.filter((product) => product.category === category);
}

// Returns a sorted COPY. The original list never changes, so "default" brings back the first order.
export function sortByPrice(list: readonly Product[], order: SortOrder): readonly Product[] {
  if (order === "price-asc") return [...list].sort((a, b) => a.price - b.price);
  if (order === "price-desc") return [...list].sort((a, b) => b.price - a.price);
  return list;
}

// Runs search, filter and sort together.
export function applyFilters(list: readonly Product[], filters: Filters): readonly Product[] {
  const searched = searchByName(list, filters.query);
  const filtered = filterByCategory(searched, filters.category);
  return sortByPrice(filtered, filters.sort);
}

// Lists each category once, in the order it first appears.
export function getCategories(list: readonly Product[]): string[] {
  return [...new Set(list.map((product) => product.category))];
}

// Finds one product by its id, or undefined if there is none.
export function findProductById(list: readonly Product[], id: number): Product | undefined {
  return list.find((product) => product.id === id);
}
