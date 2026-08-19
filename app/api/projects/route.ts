import { NextResponse } from "next/server"

import { api, logApiRequestError, toApiRequestError } from "@/lib/api"
import { getSession } from "@/lib/auth"
import {
  PROJECT_STATUSES,
  type Project,
  type ProjectRequest,
  type ProjectStatus,
} from "@/lib/types"

export const dynamic = "force-dynamic"

/**
 * GET /api/projects
 *
 * Proxies the backend `GET /projects` endpoint (list all projects). The
 * backend serves this publicly, so no admin session is required.
 */
export async function GET() {
  const startedAt = Date.now()

  try {
    const { data } = await api.get<Project[]>("/projects")
    return NextResponse.json(data)
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/projects", "GET", error, { startedAt })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/**
 * POST /api/projects
 *
 * Proxies the backend `POST /projects` endpoint (create a new project).
 */
export async function POST(request: Request) {
  const session = await getSession()

  if (!session) {
    console.warn("[api/projects] POST rejected: no session")
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  let body: ProjectRequest
  try {
    body = (await request.json()) as ProjectRequest
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const name = body.name?.trim()
  if (!name) {
    return NextResponse.json({ error: "Project name is required." }, { status: 400 })
  }

  if (body.status && !PROJECT_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid project status." }, { status: 400 })
  }

  const startedAt = Date.now()

  try {
    const { data } = await api.post<Project>("/projects", buildProjectRequest(body), {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/projects", "POST", error, {
      username: session.username,
      startedAt,
    })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/** Build the backend `ProjectRequest` payload, omitting blank/optional fields. */
function buildProjectRequest(body: ProjectRequest): ProjectRequest {
  const request: ProjectRequest = { name: body.name }

  for (const key of [
    "description",
    "techStack",
    "projectUrl",
    "repoUrl",
    "featuredImageUrl",
  ] as const) {
    const value = body[key]?.trim()
    if (value) request[key] = value
  }

  if (typeof body.featured === "boolean") request.featured = body.featured
  if (body.status) request.status = body.status as ProjectStatus

  if (body.completedAt) {
    const date = new Date(body.completedAt)
    if (!Number.isNaN(date.getTime())) request.completedAt = date.toISOString()
  }

  if (Array.isArray(body.skills)) request.skills = body.skills

  return request
}
