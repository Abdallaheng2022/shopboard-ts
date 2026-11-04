// globalErrors.ts: the last safety net. Any error no other code caught is logged and shown as a toast.
import { showToast } from "./toast";

const UNEXPECTED_MESSAGE = "Something went wrong. Please refresh the page.";

// Listens for errors that escaped every try/catch, including rejected promises.
export function setupGlobalErrorHandlers(): void {
  window.addEventListener("error", (event) => {
    console.error(event.error);
    showToast(UNEXPECTED_MESSAGE, "error");
  });
  window.addEventListener("unhandledrejection", (event) => {
    console.error(event.reason);
    showToast(UNEXPECTED_MESSAGE, "error");
  });
}
