"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { CircleAlert, CircleCheck } from "lucide-react"

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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import type { SiteSettings, SiteSettingsRequest } from "@/lib/types"

type FormState = {
  heroTitle: string
  heroSubtitle: string
  aboutMe: string
  resumeUrl: string
  githubUrl: string
  twitterUrl: string
  linkedInUrl: string
  metaTitle: string
  metaDescription: string
  phone: string
  email: string
}

const TEXT_INPUTS: {
  key: keyof FormState
  label: string
  type?: "text" | "url" | "email" | "tel"
  placeholder: string
}[] = [
  { key: "heroTitle", label: "Hero title", placeholder: "Hi, I'm Marko" },
  { key: "heroSubtitle", label: "Hero subtitle", placeholder: "Full-stack developer" },
  { key: "phone", label: "Phone", type: "tel", placeholder: "+1 555 123 4567" },
  { key: "email", label: "Email", type: "email", placeholder: "marko@example.com" },
  { key: "resumeUrl", label: "Résumé URL", type: "url", placeholder: "https://…/resume.pdf" },
  { key: "githubUrl", label: "GitHub URL", type: "url", placeholder: "https://github.com/…" },
  { key: "twitterUrl", label: "Twitter / X URL", type: "url", placeholder: "https://twitter.com/…" },
  { key: "linkedInUrl", label: "LinkedIn URL", type: "url", placeholder: "https://linkedin.com/in/…" },
  { key: "metaTitle", label: "SEO meta title", placeholder: "Marko — Portfolio" },
]

const TEXTAREAS: {
  key: keyof FormState
  label: string
  rows: number
  placeholder: string
}[] = [
  {
    key: "aboutMe",
    label: "About me",
    rows: 4,
    placeholder: "Tell visitors about yourself…",
  },
  {
    key: "metaDescription",
    label: "SEO meta description",
    rows: 3,
    placeholder: "Portfolio of Marko.",
  },
]

type SiteSettingsFormProps = {
  settings?: SiteSettings | null
}

export function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  const router = useRouter()

  const [form, setForm] = useState<FormState>({
    heroTitle: settings?.heroTitle ?? "",
    heroSubtitle: settings?.heroSubtitle ?? "",
    aboutMe: settings?.aboutMe ?? "",
    resumeUrl: settings?.resumeUrl ?? "",
    githubUrl: settings?.githubUrl ?? "",
    twitterUrl: settings?.twitterUrl ?? "",
    linkedInUrl: settings?.linkedInUrl ?? "",
    metaTitle: settings?.metaTitle ?? "",
    metaDescription: settings?.metaDescription ?? "",
    phone: settings?.phone ?? "",
    email: settings?.email ?? "",
  })
  const [saved, setSaved] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSaved(false)
    setFormError(null)
    setIsSubmitting(true)

    const payload: SiteSettingsRequest = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()])
    )

    try {
      await axios.post("/api/site", payload)
      setSaved(true)
      router.refresh()
    } catch (error) {
      if (axios.isAxiosError<{ error?: string }>(error)) {
        setFormError(error.response?.data?.error ?? "The site settings could not be saved.")
      } else {
        setFormError("Unable to reach the server. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEmpty = Object.values(form).every((value) => value.trim() === "")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEmpty ? "Site settings" : "Edit site settings"}</CardTitle>
        <CardDescription>
          Save your changes to update the portfolio site-wide content.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate>
        <CardContent>
          <FieldGroup>
            {TEXT_INPUTS.map(({ key, label, type = "text", placeholder }) => (
              <Field key={key}>
                <FieldLabel htmlFor={key}>{label}</FieldLabel>
                <Input
                  id={key}
                  name={key}
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                />
              </Field>
            ))}

            {TEXTAREAS.map(({ key, label, rows, placeholder }) => (
              <Field key={key}>
                <FieldLabel htmlFor={key}>{label}</FieldLabel>
                <Textarea
                  id={key}
                  name={key}
                  rows={rows}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                />
              </Field>
            ))}

            {saved ? (
              <Alert variant="default">
                <CircleCheck aria-hidden="true" />
                <AlertTitle>Site settings saved</AlertTitle>
                <AlertDescription>
                  Your changes are now live on the portfolio.
                </AlertDescription>
              </Alert>
            ) : null}

            {formError ? (
              <Alert variant="destructive">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>Could not save site settings</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
          </FieldGroup>
        </CardContent>

        <CardFooter className="mt-5">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
