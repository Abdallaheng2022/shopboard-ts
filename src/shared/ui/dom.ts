// dom.ts: one helper to find elements on the page. Used by every *.ui.ts file.

// Finds an element and checks that it is the expected kind, for example HTMLDialogElement.
// Throws a clear error if index.html doesn't have it, so a typo in a selector fails right away.
// The instanceof check is what lets TypeScript know the type, without an `as`.
export function getElement<T extends HTMLElement>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) {
    throw new Error(`Element not found in index.html, or not a ${type.name}: ${selector}`);
  }
  return element;
}
