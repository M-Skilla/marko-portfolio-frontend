import { NextResponse } from "next/server"

import { clearSession } from "@/lib/auth"

/**
 * POST /api/auth/logout
 *
 * Clears the httpOnly session cookie.
 */
export async function POST() {
  try {
    await clearSession()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[api/auth/logout] Failed to clear session:", error)
    return NextResponse.json(
      { error: "Could not sign out right now. Please try again." },
      { status: 500 }
    )
  }
}
