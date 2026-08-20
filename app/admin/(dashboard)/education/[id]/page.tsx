import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, CircleAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/server-api"
import type { FormalEducation } from "@/lib/types"

import { EducationForm } from "../_components/education-form"

export const metadata: Metadata = {
  title: "Edit education entry | Admin",
  description: "Update an education entry in the Marko Portfolio admin.",
}

export default async function EditEducationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let education: FormalEducation
  try {
    education = await apiClient<FormalEducation>(`/api/education/${id}`)
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-xl font-semibold">Edit education entry</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/admin/education" />}
            nativeButton={false}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to education
          </Button>
        </div>
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Could not load education entry</AlertTitle>
          <AlertDescription>
            The education entry could not be loaded. It may have been deleted.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold">Edit education entry</h1>
          <p className="text-sm text-muted-foreground">
            Update “{education.institution}”.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/education" />}
          nativeButton={false}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to education
        </Button>
      </div>

      <EducationForm education={education} />
    </div>
  )
}
