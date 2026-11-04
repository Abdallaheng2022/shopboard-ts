// connection.ts: tells the user when the browser goes offline or comes back online.
import { showToast } from "./toast";

// Shows a toast on every change, and calls onBackOnline when the connection returns.
export function setupConnectionWatcher(onBackOnline: () => void): void {
  window.addEventListener("offline", () => {
    showToast("You're offline. Some features won't work until you reconnect.", "error");
  });
  window.addEventListener("online", () => {
    showToast("You're back online.");
    onBackOnline();
  });
}
