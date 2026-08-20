"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { CircleAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import type { Achievement, AchievementRequest } from "@/lib/types"

import { ImageUpload } from "../../_components/image-upload"

type FormState = {
  name: string
  imageUrl: string
  description: string
  achievedDate: string
  issuer: string
}

type FieldErrors = {
  name?: string
}

type AchievementFormProps = {
  /** When provided, the form edits an existing achievement instead of creating one. */
  achievement?: Achievement
}

export function AchievementForm({ achievement }: AchievementFormProps) {
  const router = useRouter()
  const isEditing = Boolean(achievement)

  const [form, setForm] = useState<FormState>({
    name: achievement?.name ?? "",
    imageUrl: achievement?.imageUrl ?? "",
    description: achievement?.description ?? "",
    achievedDate: achievement?.achievedDate ?? "",
    issuer: achievement?.issuer ?? "",
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors: FieldErrors = {}
    if (!form.name.trim()) errors.name = "Achievement name is required."

    setFieldErrors(errors)
    setFormError(null)

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)

    const payload: AchievementRequest = {
      name: form.name.trim(),
      // `null` achievedDate explicitly means "no date" on the backend.
      achievedDate: form.achievedDate || null,
    }

    for (const key of ["imageUrl", "description", "issuer"] as const) {
      const value = form[key].trim()
      if (value) payload[key] = value
    }

    try {
      if (achievement) {
        await axios.put(`/api/achievements/${achievement.id}`, payload)
      } else {
        await axios.post("/api/achievements", payload)
      }

      router.push("/admin/achievements")
      router.refresh()
    } catch (error) {
      if (axios.isAxiosError<{ error?: string }>(error)) {
        setFormError(
          error.response?.data?.error ??
            `The achievement could not be ${isEditing ? "updated" : "created"}.`
        )
      } else {
        setFormError("Unable to reach the server. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Achievement details" : "New achievement"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the details below and save your changes."
            : "Fill in the details below to add a new achievement."}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={fieldErrors.name ? true : undefined}>
              <FieldLabel htmlFor="name">Name *</FieldLabel>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Winner — Hackathon 2025"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                aria-invalid={fieldErrors.name ? true : undefined}
              />
              <FieldError>{fieldErrors.name}</FieldError>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="issuer">Issuer</FieldLabel>
                <Input
                  id="issuer"
                  name="issuer"
                  placeholder="e.g. Tech Association"
                  value={form.issuer}
                  onChange={(event) => updateField("issuer", event.target.value)}
                />
                <FieldDescription>The organization that granted the achievement.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="achievedDate">Achieved on</FieldLabel>
                <Input
                  id="achievedDate"
                  name="achievedDate"
                  type="date"
                  value={form.achievedDate}
                  onChange={(event) => updateField("achievedDate", event.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="image">Image</FieldLabel>
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => updateField("imageUrl", url)}
                folder="achievements"
              />
              <FieldDescription>
                Upload a badge or certificate image. It is stored in Vercel Blob and its URL is
                saved with the achievement.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Describe the achievement…"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </Field>

            {formError ? (
              <Alert variant="destructive">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>
                  {isEditing ? "Could not update achievement" : "Could not create achievement"}
                </AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
          </FieldGroup>
        </CardContent>

        <CardFooter className="mt-5">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
            {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Create achievement"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
