// index.ts: the register module's only public entry. main.ts calls initRegister() once.
import { setupRegisterDialog } from "./register.ui";

// Sets up the sign-up dialog and its listeners. Call it once.
export function initRegister(): void {
  setupRegisterDialog();
}
