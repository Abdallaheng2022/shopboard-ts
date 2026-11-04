// main.ts: the entry point. Loads the products, then connects the modules to each other.
import "./style.css";
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
} from "./modules/products/products.ui";
import {
  addItem,
  clearCart,
  decreaseItem,
  getCart,
  increaseItem,
  removeItem,
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

// Starts the app: downloads the products, draws the page and listens to the user.
async function start(): Promise<void> {
  let products: readonly Product[];
  try {
    products = await fetchProducts();
  } catch (error) {
    console.error(error);
    renderProductsError("Couldn't load the products. Please refresh the page.");
    showToast("Couldn't load the products.", "error");
    return;
  }

  // Draws the products that match the current search, category and sort.
  const updateProducts = (): void => renderProducts(applyFilters(products, readFilters()));

  renderCategoryOptions(getCategories(products));
  updateProducts();
  renderCart(getCart(), products);

  // Every listener is added once, here. Redrawing never adds more.
  onFiltersChange(updateProducts);

  onAddToCart((productId) => {
    const product = findProductById(products, productId);
    if (product === undefined || !product.inStock) return;
    renderCart(addItem(productId), products);
    openCart();
  });

  onCartAction((action, productId) => {
    renderCart(cartActions[action](productId), products);
  });

  onClearCart(() => {
    renderCart(clearCart(), products);
    showToast("Cart cleared.");
  });
}

setupCartDrawer();
setupRegisterDialog();
start();
