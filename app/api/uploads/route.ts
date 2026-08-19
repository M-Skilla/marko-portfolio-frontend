import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

import { logApiRequestError } from "@/lib/api"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

const ALLOWED_FOLDERS = ["projects", "skills", "site"] as const
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number]

const DEFAULT_FOLDER: AllowedFolder = "projects"
const MAX_IMAGE_SIZE = 4 * 1024 * 1024 // 4 MB — keep under Vercel's 4.5 MB function body limit

/**
 * POST /api/uploads
 *
 * Uploads an image to Vercel Blob storage and returns the public URL. Which
 * module the image belongs to is passed as a `folder` form field (validated
 * against an allowlist); it becomes the blob pathname prefix.
 *
 * Expects `multipart/form-data` with a `file` field containing an image.
 */
export async function POST(request: Request) {
  const session = await getSession()

  if (!session) {
    console.warn("[api/uploads] Upload rejected: no session")
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const startedAt = Date.now()

  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file is required." }, { status: 400 })
    }

    const folder = parseFolder(formData.get("folder"))
    if (!folder) {
      return NextResponse.json({ error: "Invalid upload folder." }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 })
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "The image must be smaller than 4 MB." },
        { status: 413 }
      )
    }

    const blob = await put(`${folder}/${sanitizeFilename(file.name)}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    })

    console.info(
      `[api/uploads] Uploaded ${blob.pathname} (${file.size} bytes) for ${
        session.username ?? "unknown"
      } in ${Date.now() - startedAt}ms`
    )

    return NextResponse.json({ url: blob.url, pathname: blob.pathname })
  } catch (error) {
    logApiRequestError("api/uploads", "POST", error, {
      username: session.username,
      startedAt,
    })
    return NextResponse.json(
      { error: "The image could not be uploaded. Please try again." },
      { status: 500 }
    )
  }
}

/** Validate the folder against the allowlist; defaults to `projects`. */
function parseFolder(value: FormDataEntryValue | null): AllowedFolder | null {
  if (value === null || value === "") return DEFAULT_FOLDER
  if (typeof value !== "string") return null
  if (!ALLOWED_FOLDERS.includes(value as AllowedFolder)) return null
  return value as AllowedFolder
}

/** Make a filename safe to use in a public blob URL path. */
function sanitizeFilename(filename: string): string {
  const base = filename.split("/").pop() ?? filename
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "image"
  )
}
