// main.ts: the entry point. Loads the products, then connects the modules to each other.
import "./style.css";
import { getErrorMessage } from "./shared/api/errors";
import { setupConnectionWatcher } from "./shared/ui/connection";
import { setupGlobalErrorHandlers } from "./shared/ui/globalErrors";
import { showToast } from "./shared/ui/toast";
import { fetchProducts } from "./modules/products/products.api";
import { applyFilters, findProductById, getCategories } from "./modules/products/products.logic";
import {
  onAddToCart,
  onFiltersChange,
  readFilters,
  renderCategoryOptions,
  renderProducts,
  renderProductsError,
  renderProductsLoading,
} from "./modules/products/products.ui";
import {
  addItem,
  clearCart,
  decreaseItem,
  didLastSaveFail,
  getCart,
  increaseItem,
  removeItem,
  removeUnknownItems,
} from "./modules/cart/cart.state";
import {
  onCartAction,
  onClearCart,
  openCart,
  renderCart,
  setupCartDrawer,
} from "./modules/cart/cart.ui";
import { setupRegisterDialog } from "./modules/register/register.ui";
import type { Cart, CartAction } from "./modules/cart/cart.types";
import type { Product } from "./modules/products/products.types";

// Which cart.state function runs for each button on a cart line.
const cartActions: Record<CartAction, (productId: number) => Cart> = {
  increase: increaseItem,
  decrease: decreaseItem,
  remove: removeItem,
};

// Where loading the products stands. "failed" lets the app retry when the connection returns.
type LoadState = "idle" | "loading" | "loaded" | "failed";

let products: readonly Product[] = [];
let loadState: LoadState = "idle";
let warnedAboutSaving = false;

// Draws the cart, and warns once if it couldn't be saved on this device.
function updateCart(cart: Cart): void {
  renderCart(cart, products);
  if (didLastSaveFail() && !warnedAboutSaving) {
    warnedAboutSaving = true;
    showToast("Your cart can't be saved on this device. It will reset when you leave.", "error");
  }
}

// Draws the products that match the current search, category and sort.
function updateProducts(): void {
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
  updateProducts();
  updateCart(removeUnknownItems(products.map((product) => product.id)));
}

// Connects every listener once, then starts loading.
function start(): void {
  setupGlobalErrorHandlers();
  setupConnectionWatcher(() => {
    if (loadState === "failed") void loadProducts();
  });
  setupCartDrawer();
  setupRegisterDialog();

  onFiltersChange(updateProducts);

  onAddToCart((productId) => {
    const product = findProductById(products, productId);
    if (product === undefined || !product.inStock) return;
    updateCart(addItem(productId));
    openCart();
  });

  onCartAction((action, productId) => {
    const product = findProductById(products, productId);
    if (action === "increase" && (product === undefined || !product.inStock)) return;
    updateCart(cartActions[action](productId));
  });

  onClearCart(() => {
    updateCart(clearCart());
    showToast("Cart cleared.");
  });

  renderCart(getCart(), products);
  void loadProducts();
}

start();
