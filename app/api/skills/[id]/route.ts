import { NextResponse } from "next/server"

import { api, logApiRequestError, toApiRequestError } from "@/lib/api"
import { getSession } from "@/lib/auth"
import type { SkillTechnology, SkillTechnologyRequest } from "@/lib/types"

export const dynamic = "force-dynamic"

/**
 * GET /api/skills/[id]
 *
 * Proxies the backend `GET /skills/{id}` endpoint (fetch a single skill).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    console.warn("[api/skills/[id]] GET rejected: no session")
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { id } = await params
  const startedAt = Date.now()

  try {
    const { data } = await api.get<SkillTechnology>(`/skills/${id}`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    return NextResponse.json(data)
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/skills/[id]", "GET", error, {
      username: session.username,
      startedAt,
    })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/**
 * PUT /api/skills/[id]
 *
 * Proxies the backend `PUT /skills/{id}` endpoint (update a skill).
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    console.warn("[api/skills/[id]] PUT rejected: no session")
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  let body: SkillTechnologyRequest
  try {
    body = (await request.json()) as SkillTechnologyRequest
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const name = body.name?.trim()
  if (!name) {
    return NextResponse.json({ error: "Skill name is required." }, { status: 400 })
  }

  const { id } = await params
  const startedAt = Date.now()

  try {
    const { data } = await api.put<SkillTechnology>(`/skills/${id}`, buildSkillRequest(body), {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    return NextResponse.json(data)
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/skills/[id]", "PUT", error, {
      username: session.username,
      startedAt,
    })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/**
 * DELETE /api/skills/[id]
 *
 * Proxies the backend `DELETE /skills/{id}` endpoint.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    console.warn("[api/skills/[id]] DELETE rejected: no session")
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { id } = await params
  const startedAt = Date.now()

  try {
    await api.delete(`/skills/${id}`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    console.info(`[api/skills/[id]] Deleted skill ${id} in ${Date.now() - startedAt}ms`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/skills/[id]", "DELETE", error, {
      username: session.username,
      startedAt,
    })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/** Build the backend `SkillTechnologyRequest` payload, omitting blank fields. */
function buildSkillRequest(body: SkillTechnologyRequest): SkillTechnologyRequest {
  const request: SkillTechnologyRequest = { name: body.name }

  for (const key of ["iconSvg", "category"] as const) {
    const value = body[key]?.trim()
    if (value) request[key] = value
  }

  return request
}