import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

import { EducationForm } from "../_components/education-form"

export const metadata: Metadata = {
  title: "New education entry | Admin",
  description: "Add a new education entry in the Marko Portfolio admin.",
}

export default function NewEducationPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold">New education entry</h1>
          <p className="text-sm text-muted-foreground">
            Add a new education entry to your portfolio.
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

      <EducationForm />
    </div>
  )
}
