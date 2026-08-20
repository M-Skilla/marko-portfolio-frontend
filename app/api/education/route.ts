import { NextResponse } from "next/server"

import { api, logApiRequestError, toApiRequestError } from "@/lib/api"
import { getSession } from "@/lib/auth"
import type { FormalEducation, FormalEducationRequest } from "@/lib/types"

export const dynamic = "force-dynamic"

/**
 * GET /api/education
 *
 * Proxies the backend `GET /education` endpoint (list all formal education
 * entries). The backend serves this publicly, so no admin session is required.
 */
export async function GET() {
  const startedAt = Date.now()

  try {
    const { data } = await api.get<FormalEducation[]>("/education")
    return NextResponse.json(data)
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/education", "GET", error, { startedAt })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/**
 * POST /api/education
 *
 * Proxies the backend `POST /education` endpoint (create a new education
 * entry).
 */
export async function POST(request: Request) {
  const session = await getSession()

  if (!session) {
    console.warn("[api/education] POST rejected: no session")
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  let body: FormalEducationRequest
  try {
    body = (await request.json()) as FormalEducationRequest
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const institution = body.institution?.trim()
  const startDate = body.startDate?.trim()

  if (!institution) {
    return NextResponse.json({ error: "Institution is required." }, { status: 400 })
  }

  if (!startDate) {
    return NextResponse.json({ error: "Start date is required." }, { status: 400 })
  }

  const startedAt = Date.now()

  try {
    const { data } = await api.post<FormalEducation>(
      "/education",
      buildEducationRequest(body),
      { headers: { Authorization: `Bearer ${session.token}` } }
    )
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/education", "POST", error, {
      username: session.username,
      startedAt,
    })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/** Build the backend `FormalEducationRequest` payload, omitting blank fields. */
function buildEducationRequest(body: FormalEducationRequest): FormalEducationRequest {
  const request: FormalEducationRequest = { institution: body.institution }

  if (body.startDate) request.startDate = body.startDate

  for (const key of ["degree", "fieldOfStudy", "description", "location", "grade"] as const) {
    const value = body[key]?.trim()
    if (value) request[key] = value
  }

  // `null` explicitly means "still ongoing"; empty string is normalized to `null`.
  if ("endDate" in body) request.endDate = body.endDate ?? null

  return request
}
