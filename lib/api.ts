import axios from "axios"

export const API_BASE_URL =
  process.env.API_BASE_URL ?? "https://api.portfolio.markoskilla.com"

/**
 * Shared axios instance for the Marko Portfolio backend API.
 *
 * - Base URL is read from `API_BASE_URL` (see `.env.local`).
 * - Sends `Content-Type: application/json` on every request by default.
 * - Attach a JWT per request via `headers: { Authorization: `Bearer ${token}` }`.
 * - 2xx responses resolve with `response.data`; HTTP errors and connection
 *   failures reject with an `AxiosError` (use `toApiRequestError` to normalize).
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
})

export class ApiRequestError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(body: unknown, status: number) {
    super(
      extractErrorMessage(body) ??
        (status
          ? `Request failed with status ${status}`
          : "Could not reach the backend API")
    )
    this.name = "ApiRequestError"
    this.status = status
    this.body = body
  }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError
}

/** Normalize any thrown value (e.g. an `AxiosError`) into an `ApiRequestError`. */
export function toApiRequestError(error: unknown): ApiRequestError {
  if (isApiRequestError(error)) return error

  if (axios.isAxiosError(error)) {
    return new ApiRequestError(
      error.response?.data ?? error.message,
      error.response?.status ?? 500
    )
  }

  return new ApiRequestError(null, 500)
}

/**
 * Log a failed backend/upload request with enough context to debug
 * connection/timeout issues. Never logs the Authorization header (would leak
 * the JWT into server logs) — only non-sensitive metadata.
 */
export function logApiRequestError(
  route: string,
  method: string,
  error: unknown,
  context: { username?: string | null; startedAt?: number } = {}
) {
  const apiError = toApiRequestError(error)

  const details: Record<string, unknown> = {
    method,
    status: apiError.status,
    message: error instanceof Error ? error.message : String(error),
  }

  if (context.username !== undefined) details.user = context.username
  if (context.startedAt !== undefined) details.elapsedMs = Date.now() - context.startedAt

  if (axios.isAxiosError(error)) {
    details.axios = {
      code: error.code,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      timeoutMs: error.config?.timeout,
      hasResponse: !!error.response,
      responseStatus: error.response?.status,
    }
  }

  console.error(`[${route}] ${method} failed:`, details)
}

function extractErrorMessage(body: unknown): string | null {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>
    if (typeof record.message === "string") return record.message
    if (typeof record.error === "string") return record.error
  }
  if (typeof body === "string" && body.length > 0) return body
  return null
}
