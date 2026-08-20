import { NextResponse } from "next/server"

import { api, logApiRequestError, toApiRequestError } from "@/lib/api"
import { getSession } from "@/lib/auth"
import type { Achievement, AchievementRequest } from "@/lib/types"

export const dynamic = "force-dynamic"

/**
 * GET /api/achievements
 *
 * Proxies the backend `GET /achievements` endpoint (list all achievements).
 * The backend serves this publicly, so no admin session is required.
 */
export async function GET() {
  const startedAt = Date.now()

  try {
    const { data } = await api.get<Achievement[]>("/achievements")
    return NextResponse.json(data)
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/achievements", "GET", error, { startedAt })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/**
 * POST /api/achievements
 *
 * Proxies the backend `POST /achievements` endpoint (create a new
 * achievement).
 */
export async function POST(request: Request) {
  const session = await getSession()

  if (!session) {
    console.warn("[api/achievements] POST rejected: no session")
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  let body: AchievementRequest
  try {
    body = (await request.json()) as AchievementRequest
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const name = body.name?.trim()
  if (!name) {
    return NextResponse.json({ error: "Achievement name is required." }, { status: 400 })
  }

  const startedAt = Date.now()

  try {
    const { data } = await api.post<Achievement>(
      "/achievements",
      buildAchievementRequest(body),
      { headers: { Authorization: `Bearer ${session.token}` } }
    )
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/achievements", "POST", error, {
      username: session.username,
      startedAt,
    })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/** Build the backend `AchievementRequest` payload, omitting blank fields. */
function buildAchievementRequest(body: AchievementRequest): AchievementRequest {
  const request: AchievementRequest = { name: body.name }

  for (const key of ["imageUrl", "description", "issuer"] as const) {
    const value = body[key]?.trim()
    if (value) request[key] = value
  }

  // `null` explicitly means "no date"; empty string is normalized to `null`.
  if ("achievedDate" in body) request.achievedDate = body.achievedDate ?? null

  return request
}
