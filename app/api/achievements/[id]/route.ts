import { NextResponse } from "next/server"

import { api, logApiRequestError, toApiRequestError } from "@/lib/api"
import { getSession } from "@/lib/auth"
import type { Achievement, AchievementRequest } from "@/lib/types"

export const dynamic = "force-dynamic"

/**
 * GET /api/achievements/[id]
 *
 * Proxies the backend `GET /achievements/{id}` endpoint (fetch a single
 * achievement). The backend serves this publicly, so no admin session is
 * required.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const startedAt = Date.now()

  try {
    const { data } = await api.get<Achievement>(`/achievements/${id}`)
    return NextResponse.json(data)
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/achievements/[id]", "GET", error, { startedAt })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/**
 * PUT /api/achievements/[id]
 *
 * Proxies the backend `PUT /achievements/{id}` endpoint (update an
 * achievement).
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    console.warn("[api/achievements/[id]] PUT rejected: no session")
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

  const { id } = await params
  const startedAt = Date.now()

  try {
    const { data } = await api.put<Achievement>(
      `/achievements/${id}`,
      buildAchievementRequest(body),
      { headers: { Authorization: `Bearer ${session.token}` } }
    )
    return NextResponse.json(data)
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/achievements/[id]", "PUT", error, {
      username: session.username,
      startedAt,
    })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/**
 * DELETE /api/achievements/[id]
 *
 * Proxies the backend `DELETE /achievements/{id}` endpoint.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    console.warn("[api/achievements/[id]] DELETE rejected: no session")
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { id } = await params
  const startedAt = Date.now()

  try {
    await api.delete(`/achievements/${id}`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    console.info(
      `[api/achievements/[id]] Deleted achievement ${id} in ${Date.now() - startedAt}ms`
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/achievements/[id]", "DELETE", error, {
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
