import { NextResponse } from "next/server"

import { api, toApiRequestError } from "@/lib/api"
import { setSession } from "@/lib/auth"

type LoginRequestBody = {
  username?: string
  password?: string
}

type LoginResponse = {
  token: string
  username: string
}

/**
 * POST /api/auth/login
 *
 * Proxies the backend `POST /auth/login` endpoint, stores the returned JWT
 * in an httpOnly cookie, and returns the authenticated username.
 */
export async function POST(request: Request) {
  let body: LoginRequestBody

  try {
    body = (await request.json()) as LoginRequestBody
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const username = body.username?.trim()
  const password = body.password

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 }
    )
  }

  try {
    const { data } = await api.post<LoginResponse>("/auth/login", { username, password })

    await setSession(data.token)

    return NextResponse.json({ username: data.username ?? username })
  } catch (error) {
    const apiError = toApiRequestError(error)

    if (apiError.status === 401) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      )
    }

    console.error("[api/auth/login] Login failed:", error)

    const status = apiError.status
    const message =
      status === 500
        ? "Could not sign you in right now. Please try again later."
        : "Unable to sign in. Please try again."

    return NextResponse.json({ error: message }, { status })
  }
}
