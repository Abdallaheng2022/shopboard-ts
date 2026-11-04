// toast.ts: the only file that makes toasts (the small messages that pop up and disappear).
import { getElement } from "./dom";

// A toast is either good news or an error. Each kind has its own color in style.css.
export type ToastKind = "success" | "error";

// How long a toast stays on screen, in milliseconds. Errors stay longer so there is time to read them.
const TOAST_DURATION_MS: Record<ToastKind, number> = {
  success: 2500,
  error: 5000,
};

const region = getElement<HTMLDivElement>("#toast-region");

// Shows a message for a short time, then removes it.
export function showToast(message: string, kind: ToastKind = "success"): void {
  const toast = document.createElement("p");
  toast.className = `toast toast-${kind}`;
  toast.textContent = message;
  region.append(toast);
  setTimeout(() => toast.remove(), TOAST_DURATION_MS[kind]);
}
