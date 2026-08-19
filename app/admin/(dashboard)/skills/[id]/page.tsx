import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, CircleAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/server-api"
import type { SkillTechnology } from "@/lib/types"

import { SkillForm } from "../_components/skill-form"

export const metadata: Metadata = {
  title: "Edit skill | Admin",
  description: "Update a skill in the Marko Portfolio admin.",
}

export default async function EditSkillPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let skill: SkillTechnology
  try {
    skill = await apiClient<SkillTechnology>(`/api/skills/${id}`)
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-xl font-semibold">Edit skill</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/admin/skills" />}
            nativeButton={false}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to skills
          </Button>
        </div>
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Could not load skill</AlertTitle>
          <AlertDescription>
            The skill could not be loaded. It may have been deleted.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold">Edit skill</h1>
          <p className="text-sm text-muted-foreground">Update “{skill.name}”.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/skills" />}
          nativeButton={false}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to skills
        </Button>
      </div>

      <SkillForm skill={skill} />
    </div>
  )
}
