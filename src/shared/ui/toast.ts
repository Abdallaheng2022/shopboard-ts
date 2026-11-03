// toast.ts: the only file that makes toasts (the small messages that pop up and disappear).
import { getElement } from "./dom";

// How long a toast stays on screen, in milliseconds.
const TOAST_DURATION_MS = 2500;

// A toast is either good news or an error. Each kind has its own color in style.css.
export type ToastKind = "success" | "error";

const region = getElement<HTMLDivElement>("#toast-region");

// Shows a message for a short time, then removes it.
export function showToast(message: string, kind: ToastKind = "success"): void {
  const toast = document.createElement("p");
  toast.className = `toast toast-${kind}`;
  toast.textContent = message;
  region.append(toast);
  setTimeout(() => toast.remove(), TOAST_DURATION_MS);
}
