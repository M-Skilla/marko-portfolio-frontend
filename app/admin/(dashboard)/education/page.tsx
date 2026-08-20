import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

import { EducationList } from "./_components/education-list"
import { EducationTableSkeleton } from "./_components/education-table-skeleton"

export const metadata: Metadata = {
  title: "Education | Admin",
  description: "Manage the formal education entries in your portfolio.",
}

export default function EducationPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold">Education</h1>
          <p className="text-sm text-muted-foreground">
            View, add, edit, and remove education entries from your portfolio.
          </p>
        </div>
        <Button size="sm" render={<Link href="/admin/education/new" />} nativeButton={false}>
          <Plus data-icon="inline-start" />
          Add education
        </Button>
      </div>

      <Suspense fallback={<EducationTableSkeleton />}>
        <EducationList />
      </Suspense>
    </div>
  )
}
