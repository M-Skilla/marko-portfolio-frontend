import { NextResponse } from "next/server"

import { clearSession } from "@/lib/auth"

/**
 * POST /api/auth/logout
 *
 * Clears the httpOnly session cookie.
 */
export async function POST() {
  await clearSession()
  return NextResponse.json({ ok: true })
}
