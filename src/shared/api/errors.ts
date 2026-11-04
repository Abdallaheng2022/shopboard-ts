// errors.ts: the error type every request throws, and the message the user sees for it.

// What went wrong with a request.
export type ApiErrorKind = "offline" | "network" | "timeout" | "http" | "invalid-response";

// An error from a request. `kind` says what failed; `status` is set only for HTTP errors.
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;

  constructor(kind: ApiErrorKind, message: string, status?: number, cause?: unknown) {
    super(message, { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

// HTTP status codes that get their own message.
const STATUS_NOT_FOUND = 404;
const STATUS_TOO_MANY_REQUESTS = 429;
const STATUS_SERVER_ERROR = 500;

// Turns an HTTP status into a message the user can understand.
function getHttpMessage(status: number | undefined): string {
  if (status === STATUS_NOT_FOUND) return "We couldn't find the products (error 404).";
  if (status === STATUS_TOO_MANY_REQUESTS) {
    return "Too many requests. Please wait a moment and try again.";
  }
  if (status !== undefined && status >= STATUS_SERVER_ERROR) {
    return `The server had a problem (error ${status}). Please try again in a moment.`;
  }
  return `The request failed (error ${status ?? "unknown"}). Please try again.`;
}

// The message shown to the user for any error. Technical details go to the console, not here.
export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Something went wrong. Please try again.";
  switch (error.kind) {
    case "offline":
      return "You're offline. Check your connection and try again.";
    case "network":
      return "We couldn't reach the server. Check your connection and try again.";
    case "timeout":
      return "The server took too long to answer. Please try again.";
    case "http":
      return getHttpMessage(error.status);
    case "invalid-response":
      return "The server sent data we couldn't read. Please try again later.";
  }
}
