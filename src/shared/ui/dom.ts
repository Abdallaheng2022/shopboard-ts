// dom.ts: one helper to find elements on the page. Used by every *.ui.ts file.

// Finds an element, or throws a clear error if the HTML doesn't have it.
export function getElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) {
    throw new Error(`Element not found in index.html: ${selector}`);
  }
  return element;
}
