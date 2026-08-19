import { cookies } from "next/headers"
import { jwtDecode } from "jwt-decode"

interface JwtPayload {
  sub: string;
  username: string;
  exp: number;
}

export const AUTH_COOKIE_NAME = "admin_token"

export const AUTH_SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export type Session = {
  token: string
  username: string | null
}

/** Read the current admin session from the httpOnly auth cookie. */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return {
    token,
    username: extractUsernameFromJwt(token),
  }
}

/** Persist the JWT returned by the backend in an httpOnly cookie. */
export async function setSession(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_SESSION_MAX_AGE,
  })
}

/** Remove the admin session cookie. */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
}

function extractUsernameFromJwt(token: string): string | null {
  // const payload = decodeJwtPayload(token)
  const payload = jwtDecode<JwtPayload>(token);
  if (!payload) return null

  const claim = payload.username ?? payload.sub
  return typeof claim === "string" ? claim : null
}

// function decodeJwtPayload(token: string): Record<string, unknown> | null {
//   const parts = token.split(".")
//   if (parts.length !== 3) return null

//   try {
//     const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
//     const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")
//     const parsed = JSON.parse(atob(padded)) as unknown
//     return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null
//   } catch {
//     return null
//   }
// }
