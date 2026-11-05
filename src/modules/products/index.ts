// index.ts: the products module's only public entry. main.ts calls initProducts() once.
// Everything else in this folder is private. Other modules use the ProductsModule it returns.
import { getErrorMessage } from "../../shared/api/errors";
import { onBackOnline } from "../../shared/ui/connection";
import { fetchProducts } from "./products.api";
import { applyFilters, findProductById, getCategories } from "./products.logic";
import type { Product } from "./products.types";
import {
  onAddToCartClick,
  onFiltersChange,
  readFilters,
  renderCategoryOptions,
  renderProducts,
  renderProductsError,
  renderProductsLoading,
} from "./products.ui";

export type { Product } from "./products.types";

// What other modules can do with the products. They never see this module's files directly.
export interface ProductsModule {
  // Every product the store has. Empty until the first load succeeds.
  getAll(): readonly Product[];
  // One product by id, or undefined if the store doesn't have it (or hasn't loaded yet).
  findById(id: number): Product | undefined;
  // Called after every successful load. Called right away if the products are already loaded.
  onLoaded(handler: (products: readonly Product[]) => void): void;
  // Called when the user clicks "Add to cart" on a product that is in stock.
  onAddToCart(handler: (product: Product) => void): void;
}

// Where loading the products stands. "failed" lets the module retry when the connection returns.
type LoadState = "idle" | "loading" | "loaded" | "failed";

// Sets up the product grid, its controls and its listeners, then starts loading.
// Call it once: every listener is added here, and a retry only reloads the data.
export function initProducts(): ProductsModule {
  let products: readonly Product[] = [];
  let loadState: LoadState = "idle";
  const loadedHandlers: Array<(products: readonly Product[]) => void> = [];
  const addToCartHandlers: Array<(product: Product) => void> = [];

  // Draws the products that match the current search, category and sort.
  function updateGrid(): void {
    renderProducts(applyFilters(products, readFilters()), products.length);
  }

  // Downloads the products and shows the loading, error, empty or loaded state.
  async function loadProducts(): Promise<void> {
    if (loadState === "loading") return;
    loadState = "loading";
    renderProductsLoading();

    try {
      products = await fetchProducts();
    } catch (error) {
      loadState = "failed";
      console.error(error);
      // The error shows in the product area, with a retry button. No toast, so it isn't shown twice.
      renderProductsError(getErrorMessage(error), () => void loadProducts());
      return;
    }

    loadState = "loaded";
    renderCategoryOptions(getCategories(products));
    updateGrid();
    loadedHandlers.forEach((handler) => handler(products));
  }

  onFiltersChange(updateGrid);

  // Only products that exist and are in stock reach the other modules.
  onAddToCartClick((productId) => {
    const product = findProductById(products, productId);
    if (product === undefined || !product.inStock) return;
    addToCartHandlers.forEach((handler) => handler(product));
  });

  onBackOnline(() => {
    if (loadState === "failed") void loadProducts();
  });

  void loadProducts();

  return {
    getAll: () => products,
    findById: (id) => findProductById(products, id),
    onLoaded: (handler) => {
      loadedHandlers.push(handler);
      if (loadState === "loaded") handler(products);
    },
    onAddToCart: (handler) => {
      addToCartHandlers.push(handler);
    },
  };
}
