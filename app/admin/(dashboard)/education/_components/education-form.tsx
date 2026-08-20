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
import type { FormalEducation, FormalEducationRequest } from "@/lib/types"

type FormState = {
  institution: string
  degree: string
  fieldOfStudy: string
  startDate: string
  endDate: string
  description: string
  location: string
  grade: string
}

type FieldErrors = {
  institution?: string
  startDate?: string
}

type EducationFormProps = {
  /** When provided, the form edits an existing entry instead of creating one. */
  education?: FormalEducation
}

export function EducationForm({ education }: EducationFormProps) {
  const router = useRouter()
  const isEditing = Boolean(education)

  const [form, setForm] = useState<FormState>({
    institution: education?.institution ?? "",
    degree: education?.degree ?? "",
    fieldOfStudy: education?.fieldOfStudy ?? "",
    startDate: education?.startDate ?? "",
    endDate: education?.endDate ?? "",
    description: education?.description ?? "",
    location: education?.location ?? "",
    grade: education?.grade ?? "",
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
    if (!form.institution.trim()) errors.institution = "Institution is required."
    if (!form.startDate) errors.startDate = "Start date is required."

    setFieldErrors(errors)
    setFormError(null)

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)

    const payload: FormalEducationRequest = {
      institution: form.institution.trim(),
      startDate: form.startDate,
      // `null` endDate explicitly means "still ongoing" on the backend.
      endDate: form.endDate || null,
    }

    for (const key of ["degree", "fieldOfStudy", "description", "location", "grade"] as const) {
      const value = form[key].trim()
      if (value) payload[key] = value
    }

    try {
      if (education) {
        await axios.put(`/api/education/${education.id}`, payload)
      } else {
        await axios.post("/api/education", payload)
      }

      router.push("/admin/education")
      router.refresh()
    } catch (error) {
      if (axios.isAxiosError<{ error?: string }>(error)) {
        setFormError(
          error.response?.data?.error ??
            `The education entry could not be ${isEditing ? "updated" : "created"}.`
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
        <CardTitle>{isEditing ? "Education details" : "New education entry"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the details below and save your changes."
            : "Fill in the details below to add an education entry."}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={fieldErrors.institution ? true : undefined}>
              <FieldLabel htmlFor="institution">Institution *</FieldLabel>
              <Input
                id="institution"
                name="institution"
                placeholder="e.g. University of Zagreb"
                value={form.institution}
                onChange={(event) => updateField("institution", event.target.value)}
                aria-invalid={fieldErrors.institution ? true : undefined}
              />
              <FieldError>{fieldErrors.institution}</FieldError>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="degree">Degree</FieldLabel>
                <Input
                  id="degree"
                  name="degree"
                  placeholder="e.g. Bachelor of Science"
                  value={form.degree}
                  onChange={(event) => updateField("degree", event.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="fieldOfStudy">Field of study</FieldLabel>
                <Input
                  id="fieldOfStudy"
                  name="fieldOfStudy"
                  placeholder="e.g. Computer Science"
                  value={form.fieldOfStudy}
                  onChange={(event) => updateField("fieldOfStudy", event.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field data-invalid={fieldErrors.startDate ? true : undefined}>
                <FieldLabel htmlFor="startDate">Start date *</FieldLabel>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(event) => updateField("startDate", event.target.value)}
                  aria-invalid={fieldErrors.startDate ? true : undefined}
                />
                <FieldError>{fieldErrors.startDate}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="endDate">End date</FieldLabel>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(event) => updateField("endDate", event.target.value)}
                />
                <FieldDescription>
                  Leave empty if this is still ongoing — it shows as “Present”.
                </FieldDescription>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g. Zagreb, Croatia"
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="grade">Grade</FieldLabel>
                <Input
                  id="grade"
                  name="grade"
                  placeholder="e.g. 8.5/10"
                  value={form.grade}
                  onChange={(event) => updateField("grade", event.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Describe what you studied or focused on…"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </Field>

            {formError ? (
              <Alert variant="destructive">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>
                  {isEditing ? "Could not update education entry" : "Could not create education entry"}
                </AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
            {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Create entry"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

