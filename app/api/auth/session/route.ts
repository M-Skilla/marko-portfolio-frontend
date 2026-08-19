import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth"

/**
 * GET /api/auth/session
 *
 * Reports whether the current request has a valid admin session and, when it
 * does, the username stored in the JWT.
 */
export async function GET() {
  try {
    const session = await getSession()

    return NextResponse.json({
      authenticated: session !== null,
      username: session?.username ?? null,
    })
  } catch (error) {
    console.error("[api/auth/session] Failed to read session:", error)
    return NextResponse.json({ authenticated: false, username: null })
  }
}
