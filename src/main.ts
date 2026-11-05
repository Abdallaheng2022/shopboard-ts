// main.ts: the entry point. Sets up the app-wide handlers, then starts each module with one call.
// Each module sets up its own state, listeners and requests inside its init function.
import "./style.css";
import { setupConnectionWatcher } from "./shared/ui/connection";
import { setupGlobalErrorHandlers } from "./shared/ui/globalErrors";
import { initProducts } from "./modules/products";
import { initCart } from "./modules/cart";
import { initRegister } from "./modules/register";

setupGlobalErrorHandlers();
setupConnectionWatcher();

const products = initProducts();
initCart(products);
initRegister();
