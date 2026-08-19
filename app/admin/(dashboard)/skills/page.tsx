import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

import { SkillsList } from "./_components/skills-list"
import { SkillsTableSkeleton } from "./_components/skills-table-skeleton"

export const metadata: Metadata = {
  title: "Skills | Admin",
  description: "Manage the skills and technologies in your portfolio.",
}

export default function SkillsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold">Skills</h1>
          <p className="text-sm text-muted-foreground">
            View, add, edit, and remove skills from your portfolio.
          </p>
        </div>
        <Button size="sm" render={<Link href="/admin/skills/new" />} nativeButton={false}>
          <Plus data-icon="inline-start" />
          Add skill
        </Button>
      </div>

      <Suspense fallback={<SkillsTableSkeleton />}>
        <SkillsList />
      </Suspense>
    </div>
  )
}
