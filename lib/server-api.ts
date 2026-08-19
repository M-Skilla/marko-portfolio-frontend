import axios from "axios"
import { cookies, headers } from "next/headers"

/**
 * Call one of the app's own Next.js API routes (e.g. `/api/projects`) from a
 * Server Component. The incoming request's cookies are forwarded so the route
 * can authenticate via the httpOnly session cookie.
 */
export async function apiClient<T>(path: string): Promise<T> {
  const cookieStore = await cookies()
  const headerStore = await headers()

  const host =
    headerStore.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    headerStore.get("host") ??
    "localhost:3000"
  const proto = headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "http"

  const { data } = await axios.get<T>(`${proto}://${host}${path}`, {
    headers: { Cookie: cookieStore.toString() },
  })

  return data
}

/**
 * Call one of the app's own public (unauthenticated) read routes (e.g.
 * `/api/site`, `/api/projects`, `/api/skills`) from a Server Component. No
 * cookies are forwarded — the backend serves these GETs publicly. Uses the
 * default fetch cache so Next.js deduplicates identical calls within a render
 * (the page stays dynamic because it reads request headers).
 */
export async function fetchPublic<T>(path: string): Promise<T> {
  const headerStore = await headers()

  const host =
    headerStore.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    headerStore.get("host") ??
    "localhost:3000"
  const proto = headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "http"

  const response = await fetch(`${proto}://${host}${path}`)

  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}
