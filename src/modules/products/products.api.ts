// products.api.ts: gets the products from the server and turns them into our Product shape.
import { getJson } from "../../shared/api/client";
import type { Product } from "./products.types";

// Where the products live.
const PRODUCTS_URL = "https://shopboard-api.vercel.app/api/products";

// The API sends prices in cents. 8900 cents = $89.
const CENTS_PER_DOLLAR = 100;

// One product exactly as the API sends it. The names are different from our Product.
interface ApiProduct {
  id: number;
  title: string;
  category_name: string;
  price_cents: number;
  in_stock: boolean;
}

// Checks that one value from the server really is an API product.
function isApiProduct(value: unknown): value is ApiProduct {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number" &&
    "title" in value &&
    typeof value.title === "string" &&
    "category_name" in value &&
    typeof value.category_name === "string" &&
    "price_cents" in value &&
    typeof value.price_cents === "number" &&
    "in_stock" in value &&
    typeof value.in_stock === "boolean"
  );
}

// Turns the API's shape into ours, so the rest of the app never sees the API's names.
function toProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.title,
    category: apiProduct.category_name,
    price: apiProduct.price_cents / CENTS_PER_DOLLAR,
    inStock: apiProduct.in_stock,
  };
}

// The API wraps the list: { items: [...], total: 12 }. This takes the list out.
function getItems(data: unknown): unknown[] {
  if (typeof data === "object" && data !== null && "items" in data && Array.isArray(data.items)) {
    return data.items;
  }
  throw new Error("Products response has no items list");
}

// Downloads the products. Anything that isn't a valid product is skipped.
export async function fetchProducts(): Promise<readonly Product[]> {
  const data = await getJson(PRODUCTS_URL);
  return getItems(data).filter(isApiProduct).map(toProduct);
}
