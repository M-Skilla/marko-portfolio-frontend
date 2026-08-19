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
import type { SkillTechnology } from "@/lib/types"

type FormState = {
  name: string
  category: string
  iconSvg: string
}

type FieldErrors = {
  name?: string
}

type SkillFormProps = {
  /** When provided, the form edits an existing skill instead of creating one. */
  skill?: SkillTechnology
}

export function SkillForm({ skill }: SkillFormProps) {
  const router = useRouter()
  const isEditing = Boolean(skill)

  const [form, setForm] = useState<FormState>({
    name: skill?.name ?? "",
    category: skill?.category ?? "",
    iconSvg: skill?.iconSvg ?? "",
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
    if (!form.name.trim()) errors.name = "Skill name is required."

    setFieldErrors(errors)
    setFormError(null)

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)

    const payload = {
      ...form,
      name: form.name.trim(),
    }

    try {
      if (skill) {
        await axios.put(`/api/skills/${skill.id}`, payload)
      } else {
        await axios.post("/api/skills", payload)
      }

      router.push("/admin/skills")
      router.refresh()
    } catch (error) {
      if (axios.isAxiosError<{ error?: string }>(error)) {
        setFormError(
          error.response?.data?.error ??
            `The skill could not be ${isEditing ? "updated" : "created"}.`
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
        <CardTitle>{isEditing ? "Skill details" : "New skill"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the details below and save your changes."
            : "Fill in the details below to add a new skill."}
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
                placeholder="e.g. Spring Boot"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                aria-invalid={fieldErrors.name ? true : undefined}
              />
              <FieldError>{fieldErrors.name}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <Input
                id="category"
                name="category"
                placeholder="e.g. Backend"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
              />
              <FieldDescription>
                Grouping used on the portfolio, e.g. “Frontend”.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="iconSvg">Icon SVG</FieldLabel>
              <Textarea
                id="iconSvg"
                name="iconSvg"
                rows={6}
                placeholder="<svg xmlns=&#39;http://www.w3.org/2000/svg&#39;>…</svg>"
                value={form.iconSvg}
                onChange={(event) => updateField("iconSvg", event.target.value)}
              />
              <FieldDescription>
                Paste inline SVG markup to use as the skill icon.
              </FieldDescription>
            </Field>

            {formError ? (
              <Alert variant="destructive">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>
                  {isEditing ? "Could not update skill" : "Could not create skill"}
                </AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
            {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Create skill"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
