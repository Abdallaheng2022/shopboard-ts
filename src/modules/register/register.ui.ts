// register.ui.ts: opens and closes the sign-up dialog.
import { getElement } from "../../shared/ui/dom";
import { showToast } from "../../shared/ui/toast";

const dialog = getElement<HTMLDialogElement>("#register-dialog");
const openButton = getElement<HTMLButtonElement>("#open-register");
const closeButton = getElement<HTMLButtonElement>("#close-register");
const form = getElement<HTMLFormElement>("#register-form");

// Connects the buttons, the backdrop and the form to the dialog.
export function setupRegisterDialog(): void {
  openButton.addEventListener("click", () => dialog.showModal());
  closeButton.addEventListener("click", () => dialog.close());

  // A click on the dark backdrop lands on the dialog itself, not on its content.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  // method="dialog" closes the dialog after the browser validates the form.
  form.addEventListener("submit", () => {
    showToast("Account created.");
    form.reset();
  });
}
