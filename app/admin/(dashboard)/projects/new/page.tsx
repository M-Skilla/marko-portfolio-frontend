import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

import { ProjectForm } from "./_components/project-form"

export const metadata: Metadata = {
  title: "New project | Admin",
  description: "Create a new project in the Marko Portfolio admin.",
}

export default function NewProjectPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold">New project</h1>
          <p className="text-sm text-muted-foreground">Add a new project to your portfolio.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/projects" />}
          nativeButton={false}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to projects
        </Button>
      </div>

      <ProjectForm />
    </div>
  )
}
