import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, CircleAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/server-api"
import type { Achievement } from "@/lib/types"

import { AchievementForm } from "../_components/achievement-form"

export const metadata: Metadata = {
  title: "Edit achievement | Admin",
  description: "Update an achievement in the Marko Portfolio admin.",
}

export default async function EditAchievementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let achievement: Achievement
  try {
    achievement = await apiClient<Achievement>(`/api/achievements/${id}`)
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-xl font-semibold">Edit achievement</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/admin/achievements" />}
            nativeButton={false}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to achievements
          </Button>
        </div>
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Could not load achievement</AlertTitle>
          <AlertDescription>
            The achievement could not be loaded. It may have been deleted.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold">Edit achievement</h1>
          <p className="text-sm text-muted-foreground">Update “{achievement.name}”.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/achievements" />}
          nativeButton={false}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to achievements
        </Button>
      </div>

      <AchievementForm achievement={achievement} />
    </div>
  )
}
