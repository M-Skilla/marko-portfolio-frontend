"use client"

import { useEffect, useState, type FormEvent } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  PROJECT_STATUSES,
  type ProjectStatus,
  type SkillTechnology,
} from "@/lib/types"

import { ImageUpload } from "../../../_components/image-upload"

const STATUS_OPTIONS = [
  { label: "Select a status", value: null },
  ...PROJECT_STATUSES.map((status) => ({
    label: status.replace("_", " "),
    value: status,
  })),
]

type FormState = {
  name: string
  description: string
  techStack: string
  projectUrl: string
  repoUrl: string
  featuredImageUrl: string
  featured: boolean
  status: ProjectStatus
  completedAt: string
}

type FieldErrors = {
  name?: string
}

export function ProjectForm() {
  const router = useRouter()

  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    techStack: "",
    projectUrl: "",
    repoUrl: "",
    featuredImageUrl: "",
    featured: false,
    status: "PLANNED",
    completedAt: "",
  })
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skills, setSkills] = useState<SkillTechnology[]>([])
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    axios
      .get<SkillTechnology[]>("/api/skills")
      .then(({ data }) => {
        if (!cancelled) setSkills(data)
      })
      .catch(() => {
        // Skills are optional — the form still works if they can't be loaded.
      })
    return () => {
      cancelled = true
    }
  }, [])

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function toggleSkill(id: string, checked: boolean) {
    setSelectedSkills((current) =>
      checked ? [...current, id] : current.filter((skillId) => skillId !== id)
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors: FieldErrors = {}
    if (!form.name.trim()) errors.name = "Project name is required."

    setFieldErrors(errors)
    setFormError(null)

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await axios.post("/api/projects", {
        ...form,
        name: form.name.trim(),
        completedAt: form.completedAt || undefined,
        skills: selectedSkills,
      })

      router.push("/admin/projects")
      router.refresh()
    } catch (error) {
      if (axios.isAxiosError<{ error?: string }>(error)) {
        setFormError(error.response?.data?.error ?? "The project could not be created.")
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
        <CardTitle>Project details</CardTitle>
        <CardDescription>Fill in the details below to create a new project.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} noValidate>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              <Field data-invalid={fieldErrors.name ? true : undefined}>
                <FieldLabel htmlFor="name">Name *</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Marko Portfolio"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  aria-invalid={fieldErrors.name ? true : undefined}
                />
                <FieldError>{fieldErrors.name}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Select
                  items={STATUS_OPTIONS}
                  value={form.status}
                  onValueChange={(value) =>
                    updateField("status", (value ?? "PLANNED") as ProjectStatus)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value ?? "placeholder"} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="techStack">Tech stack</FieldLabel>
                <Input
                  id="techStack"
                  name="techStack"
                  placeholder="e.g. Spring Boot, React"
                  value={form.techStack}
                  onChange={(event) => updateField("techStack", event.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="completedAt">Completed on</FieldLabel>
                <Input
                  id="completedAt"
                  name="completedAt"
                  type="datetime-local"
                  value={form.completedAt}
                  onChange={(event) => updateField("completedAt", event.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Describe the project…"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="projectUrl">Project URL</FieldLabel>
                <Input
                  id="projectUrl"
                  name="projectUrl"
                  type="url"
                  placeholder="https://…"
                  value={form.projectUrl}
                  onChange={(event) => updateField("projectUrl", event.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="repoUrl">Repository URL</FieldLabel>
                <Input
                  id="repoUrl"
                  name="repoUrl"
                  type="url"
                  placeholder="https://github.com/…"
                  value={form.repoUrl}
                  onChange={(event) => updateField("repoUrl", event.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="featuredImage">Featured image</FieldLabel>
                <ImageUpload
                  value={form.featuredImageUrl}
                  onChange={(url) => updateField("featuredImageUrl", url)}
                  folder="projects"
                />
                <FieldDescription>
                  Upload a cover image. It is stored in Vercel Blob and its URL is saved with
                  the project.
                </FieldDescription>
              </Field>

              <Field orientation="horizontal" className="gap-3 self-end">
                <Switch
                  id="featured"
                  checked={form.featured}
                  onCheckedChange={(checked) => updateField("featured", checked)}
                />
                <FieldLabel htmlFor="featured">
                  <FieldTitle>Featured project</FieldTitle>
                  <FieldDescription>Highlight this project on the portfolio.</FieldDescription>
                </FieldLabel>
              </Field>
            </div>

            <FieldSet>
              <FieldLegend>Skills</FieldLegend>
              {skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No skills available yet. You can associate skills later.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {skills.map((skill) => (
                    <Field key={skill.id} orientation="horizontal" className="gap-2">
                      <Checkbox
                        id={`skill-${skill.id}`}
                        checked={selectedSkills.includes(skill.id)}
                        onCheckedChange={(checked) => toggleSkill(skill.id, checked)}
                      />
                      <FieldLabel htmlFor={`skill-${skill.id}`}>
                        <span>{skill.name}</span>
                      </FieldLabel>
                    </Field>
                  ))}
                </div>
              )}
            </FieldSet>

            {formError ? (
              <Alert variant="destructive">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>Could not create project</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
            {isSubmitting ? "Saving…" : "Create project"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
