// client.ts: the only file that calls fetch. Every request to the server goes through here.
// It owns the base URL. Each module asks for a client for its own subpath with createApiClient,
// for example createApiClient("/products"), and never builds a full URL itself.
import { ApiError } from "./errors";

// The root of the ShopBoard API. Every module subpath is added after this.
export const API_BASE_URL = "https://shopboard-api.vercel.app/api";

// A request that takes longer than this is stopped and reported as a timeout.
const REQUEST_TIMEOUT_MS = 10_000;

// The HTTP methods the client can send.
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// The parts of a request a module can choose.
export interface RequestOptions {
  readonly method?: HttpMethod;
  // Sent as JSON. Leave it out for requests with no body, like GET.
  readonly body?: unknown;
  // Added to the URL as ?key=value. Values are encoded for you.
  readonly query?: Readonly<Record<string, string | number | boolean>>;
}

// The client one module gets. Every path is relative to that module's subpath.
export interface ApiClient {
  get(path?: string, query?: RequestOptions["query"]): Promise<unknown>;
  post(path: string, body: unknown): Promise<unknown>;
  put(path: string, body: unknown): Promise<unknown>;
  patch(path: string, body: unknown): Promise<unknown>;
  delete(path: string): Promise<unknown>;
}

// HTTP 204 means "done, no content", so there is no JSON to read.
const STATUS_NO_CONTENT = 204;

// Joins URL parts with exactly one "/" between them: ("/products", "/12") → "/products/12".
function joinPath(...parts: readonly string[]): string {
  return parts
    .map((part) => part.replace(/^\/+|\/+$/g, ""))
    .filter((part) => part !== "")
    .join("/");
}

// Builds the full URL: base URL + path + query string.
function buildUrl(path: string, query: RequestOptions["query"]): string {
  const url = new URL(`${API_BASE_URL}/${joinPath(path)}`);
  if (query !== undefined) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// Sends one request and returns its JSON. Every failure is thrown as an ApiError with its kind.
// `path` is relative to API_BASE_URL. Modules should use createApiClient instead of calling this.
export async function request(path: string, options: RequestOptions = {}): Promise<unknown> {
  const method = options.method ?? "GET";
  const url = buildUrl(path, options.query);
  const label = `${method} ${url}`;

  if (!navigator.onLine) {
    throw new ApiError("offline", `${label} skipped: the browser is offline`);
  }

  const init: RequestInit = {
    method,
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  };
  if (options.body !== undefined) {
    init.headers = { Accept: "application/json", "Content-Type": "application/json" };
    init.body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError("timeout", `${label} timed out`, undefined, error);
    }
    throw new ApiError("network", `${label} could not reach the server`, undefined, error);
  }

  if (!response.ok) {
    throw new ApiError("http", `${label} failed with status ${response.status}`, response.status);
  }

  if (response.status === STATUS_NO_CONTENT) return undefined;

  try {
    const data: unknown = await response.json();
    return data;
  } catch (error) {
    throw new ApiError(
      "invalid-response",
      `Response from ${label} is not valid JSON`,
      undefined,
      error,
    );
  }
}

// Gives a module its own client. `subpath` is the module's part of the API, like "/products".
// Every call adds its path after it: createApiClient("/products").get("/12") → GET .../api/products/12
export function createApiClient(subpath: string): ApiClient {
  const to = (path = ""): string => joinPath(subpath, path);
  return {
    get: (path, query) => request(to(path), { method: "GET", query }),
    post: (path, body) => request(to(path), { method: "POST", body }),
    put: (path, body) => request(to(path), { method: "PUT", body }),
    patch: (path, body) => request(to(path), { method: "PATCH", body }),
    delete: (path) => request(to(path), { method: "DELETE" }),
  };
}
