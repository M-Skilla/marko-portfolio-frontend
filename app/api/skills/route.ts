import { NextResponse } from "next/server"

import { api, logApiRequestError, toApiRequestError } from "@/lib/api"
import { getSession } from "@/lib/auth"
import type { SkillTechnology, SkillTechnologyRequest } from "@/lib/types"

export const dynamic = "force-dynamic"

/**
 * GET /api/skills
 *
 * Proxies the backend `GET /skills` endpoint (list all skills/technologies).
 * The backend serves this publicly, so no admin session is required.
 */
export async function GET() {
  const startedAt = Date.now()

  try {
    const { data } = await api.get<SkillTechnology[]>("/skills")
    return NextResponse.json(data)
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/skills", "GET", error, { startedAt })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/**
 * POST /api/skills
 *
 * Proxies the backend `POST /skills` endpoint (create a new skill).
 */
export async function POST(request: Request) {
  const session = await getSession()

  if (!session) {
    console.warn("[api/skills] POST rejected: no session")
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

  const startedAt = Date.now()

  try {
    const { data } = await api.post<SkillTechnology>("/skills", buildSkillRequest(body), {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/skills", "POST", error, {
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
