"use client"

import { useRef, useState } from "react"
import axios from "axios"
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { Spinner } from "@/components/ui/spinner"

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]

const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4 MB — keep under Vercel's 4.5 MB function body limit

const DEFAULT_FOLDER = "projects"

type UploadState = "idle" | "uploading" | "error" | "done"

type ImageUploadProps = {
  value: string
  onChange: (url: string) => void
  /** Blob folder to store the file under. Must match the `/api/uploads` allowlist. */
  folder?: string
}

/**
 * File picker + Vercel Blob upload, reusable across admin modules.
 *
 * Uploads the selected file to `/api/uploads` (which stores it in Vercel Blob
 * and returns the public URL) and reports the URL back via `onChange`.
 */
export function ImageUpload({ value, onChange, folder = DEFAULT_FOLDER }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<UploadState>("idle")
  const [fileName, setFileName] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isUploading = state === "uploading"
  const hasImage = Boolean(value)

  async function handleFileSelected(file: File) {
    if (inputRef.current) inputRef.current.value = ""

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setState("error")
      setErrorMessage("Please choose a PNG, JPG, WebP, GIF, AVIF or SVG image.")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setState("error")
      setErrorMessage("The image must be smaller than 4 MB.")
      return
    }

    setState("uploading")
    setErrorMessage(null)
    setFileName(file.name)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)

    try {
      const { data } = await axios.post<{ url: string; pathname: string }>(
        "/api/uploads",
        formData
      )
      onChange(data.url)
      setState("done")
    } catch (error) {
      setState("error")
      setErrorMessage(
        axios.isAxiosError<{ error?: string }>(error)
          ? error.response?.data?.error ?? "The image could not be uploaded. Please try again."
          : "Unable to reach the server. Please try again."
      )
    }
  }

  function handleRemove() {
    onChange("")
    setState("idle")
    setFileName(null)
    setErrorMessage(null)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        aria-label="Upload image"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleFileSelected(file)
        }}
      />

      {hasImage ? (
        <Attachment state={isUploading ? "uploading" : state} className="w-full">
          <AttachmentMedia variant="image" className="size-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Image preview" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{fileName ?? "Image"}</AttachmentTitle>
            <AttachmentDescription>
              {state === "error" ? errorMessage : value}
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction
              type="button"
              size="sm"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              <RefreshCw data-icon="inline-start" />
              Replace
            </AttachmentAction>
            <AttachmentAction
              type="button"
              aria-label="Remove image"
              disabled={isUploading}
              onClick={handleRemove}
            >
              <Trash2 />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ) : (
        <Attachment state={isUploading ? "uploading" : state} className="w-full">
          <AttachmentTrigger
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          />
          <AttachmentMedia>{isUploading ? <Spinner /> : <ImagePlus />}</AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{isUploading ? "Uploading…" : "Click to upload"}</AttachmentTitle>
            <AttachmentDescription>
              {state === "error"
                ? errorMessage
                : "PNG, JPG, WebP, GIF, AVIF or SVG — max 4 MB"}
            </AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      )}
    </>
  )
}
