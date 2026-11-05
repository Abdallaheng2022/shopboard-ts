// connection.ts: tells the user when the browser goes offline or comes back online,
// and lets any module run code when the connection returns.
import { showToast } from "./toast";

// Shows a toast on every change. Called once, from main.ts, so the toasts never show twice.
export function setupConnectionWatcher(): void {
  window.addEventListener("offline", () => {
    showToast("You're offline. Some features won't work until you reconnect.", "error");
  });
  window.addEventListener("online", () => {
    showToast("You're back online.");
  });
}

// Calls the handler every time the connection returns. A module calls this once, in its init.
export function onBackOnline(handler: () => void): void {
  window.addEventListener("online", handler);
}
