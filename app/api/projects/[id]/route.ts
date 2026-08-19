import { NextResponse } from "next/server"

import { api, logApiRequestError, toApiRequestError } from "@/lib/api"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * DELETE /api/projects/[id]
 *
 * Proxies the backend `DELETE /projects/{id}` endpoint.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    console.warn("[api/projects/[id]] DELETE rejected: no session")
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { id } = await params
  const startedAt = Date.now()

  try {
    await api.delete(`/projects/${id}`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    console.info(
      `[api/projects/[id]] Deleted project ${id} in ${Date.now() - startedAt}ms`
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/projects/[id]", "DELETE", error, {
      username: session.username,
      startedAt,
    })
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}
