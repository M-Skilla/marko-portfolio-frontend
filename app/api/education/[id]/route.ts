import { NextResponse } from "next/server"

import { api, logApiRequestError, toApiRequestError } from "@/lib/api"
import { getSession } from "@/lib/auth"
import type { FormalEducation, FormalEducationRequest } from "@/lib/types"

export const dynamic = "force-dynamic"

/**
 * GET /api/education/[id]
 *
 * Proxies the backend `GET /education/{id}` endpoint (fetch a single education
 * entry). The backend serves this publicly, so no admin session is required.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const startedAt = Date.now()

  try {
    const { data } = await api.get<FormalEducation>(`/education/${id}`)
    return NextResponse.json(data)
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/education/[id]", "GET", error, { startedAt })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/**
 * PUT /api/education/[id]
 *
 * Proxies the backend `PUT /education/{id}` endpoint (update an education
 * entry).
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    console.warn("[api/education/[id]] PUT rejected: no session")
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

  const { id } = await params
  const startedAt = Date.now()

  try {
    const { data } = await api.put<FormalEducation>(
      `/education/${id}`,
      buildEducationRequest(body),
      { headers: { Authorization: `Bearer ${session.token}` } }
    )
    return NextResponse.json(data)
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/education/[id]", "PUT", error, {
      username: session.username,
      startedAt,
    })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/**
 * DELETE /api/education/[id]
 *
 * Proxies the backend `DELETE /education/{id}` endpoint.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    console.warn("[api/education/[id]] DELETE rejected: no session")
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { id } = await params
  const startedAt = Date.now()

  try {
    await api.delete(`/education/${id}`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    console.info(`[api/education/[id]] Deleted education entry ${id} in ${Date.now() - startedAt}ms`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/education/[id]", "DELETE", error, {
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
