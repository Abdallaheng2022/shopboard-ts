// index.ts: the cart module's only public entry. main.ts calls initCart(products) once.
// The cart needs the products to draw its lines and its total, so it gets the products module
// as an argument and talks to it only through ProductsModule, never through its files.
import { showToast } from "../../shared/ui/toast";
import type { ProductsModule } from "../products";
import {
  addItem,
  clearCart,
  decreaseItem,
  didLastSaveFail,
  getCart,
  increaseItem,
  removeItem,
  removeUnknownItems,
} from "./cart.state";
import type { Cart, CartAction } from "./cart.types";
import { onCartAction, onClearCart, openCart, renderCart, setupCartDrawer } from "./cart.ui";

// Which cart.state function runs for each button on a cart line.
const cartActions: Record<CartAction, (productId: number) => Cart> = {
  increase: increaseItem,
  decrease: decreaseItem,
  remove: removeItem,
};

// Sets up the cart drawer and its listeners, and connects it to the products.
// Call it once: every listener is added here.
export function initCart(products: ProductsModule): void {
  let warnedAboutSaving = false;

  // Draws the cart, and warns once if it couldn't be saved on this device.
  function updateCart(cart: Cart): void {
    renderCart(cart, products.findById);
    if (didLastSaveFail() && !warnedAboutSaving) {
      warnedAboutSaving = true;
      showToast("Your cart can't be saved on this device. It will reset when you leave.", "error");
    }
  }

  setupCartDrawer();

  // The products module only sends products that exist and are in stock.
  products.onAddToCart((product) => {
    updateCart(addItem(product.id));
    openCart();
  });

  // Once the products are known, drop saved lines for products the store no longer has.
  products.onLoaded((list) => {
    updateCart(removeUnknownItems(list.map((product) => product.id)));
  });

  onCartAction((action, productId) => {
    const product = products.findById(productId);
    if (action === "increase" && (product === undefined || !product.inStock)) return;
    updateCart(cartActions[action](productId));
  });

  onClearCart(() => {
    updateCart(clearCart());
    showToast("Cart cleared.");
  });

  // Draws the saved cart right away; its lines appear once the products load.
  renderCart(getCart(), products.findById);
}
