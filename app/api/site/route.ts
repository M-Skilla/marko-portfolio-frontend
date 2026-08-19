import { NextResponse } from "next/server"

import { api, logApiRequestError, toApiRequestError } from "@/lib/api"
import { getSession } from "@/lib/auth"
import type { SiteSettings, SiteSettingsRequest } from "@/lib/types"

export const dynamic = "force-dynamic"

/**
 * GET /api/site
 *
 * Proxies the backend `GET /site` endpoint (fetch the single settings row).
 */
export async function GET() {
  const session = await getSession()

  if (!session) {
    console.warn("[api/site] GET rejected: no session")
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const startedAt = Date.now()

  try {
    const { data } = await api.get<SiteSettings>("/site", {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    return NextResponse.json(data)
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/site", "GET", error, {
      username: session.username,
      startedAt,
    })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/**
 * POST /api/site
 *
 * Proxies the backend `POST /site` endpoint (update the single settings row).
 */
export async function POST(request: Request) {
  const session = await getSession()

  if (!session) {
    console.warn("[api/site] POST rejected: no session")
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  let body: SiteSettingsRequest
  try {
    body = (await request.json()) as SiteSettingsRequest
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const startedAt = Date.now()

  try {
    const { data } = await api.post<SiteSettings>("/site", buildSiteSettingsRequest(body), {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    return NextResponse.json(data)
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/site", "POST", error, {
      username: session.username,
      startedAt,
    })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}

/** Build the backend `SiteSettingsRequest` payload (all fields optional). */
function buildSiteSettingsRequest(body: SiteSettingsRequest): SiteSettingsRequest {
  const request: SiteSettingsRequest = {}

  for (const key of [
    "heroTitle",
    "heroSubtitle",
    "aboutMe",
    "resumeUrl",
    "githubUrl",
    "twitterUrl",
    "linkedInUrl",
    "metaTitle",
    "metaDescription",
  ] as const) {
    const value = body[key]
    if (value !== undefined) request[key] = value.trim()
  }

  return request
}