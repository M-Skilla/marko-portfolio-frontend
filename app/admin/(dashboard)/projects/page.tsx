import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

import { ProjectsList } from "./_components/projects-list"
import { ProjectsTableSkeleton } from "./_components/projects-table-skeleton"

export const metadata: Metadata = {
  title: "Projects | Admin",
  description: "Manage the projects in your portfolio.",
}

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            View, add, and remove projects from your portfolio.
          </p>
        </div>
        <Button size="sm" render={<Link href="/admin/projects/new" />} nativeButton={false}>
          <Plus data-icon="inline-start" />
          Add project
        </Button>
      </div>

      <Suspense fallback={<ProjectsTableSkeleton />}>
        <ProjectsList />
      </Suspense>
    </div>
  )
}
