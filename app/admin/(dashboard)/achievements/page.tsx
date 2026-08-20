import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

import { AchievementsList } from "./_components/achievements-list"
import { AchievementsTableSkeleton } from "./_components/achievements-table-skeleton"

export const metadata: Metadata = {
  title: "Achievements | Admin",
  description: "Manage the achievements in your portfolio.",
}

export default function AchievementsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold">Achievements</h1>
          <p className="text-sm text-muted-foreground">
            View, add, edit, and remove achievements from your portfolio.
          </p>
        </div>
        <Button
          size="sm"
          render={<Link href="/admin/achievements/new" />}
          nativeButton={false}
        >
          <Plus data-icon="inline-start" />
          Add achievement
        </Button>
      </div>

      <Suspense fallback={<AchievementsTableSkeleton />}>
        <AchievementsList />
      </Suspense>
    </div>
  )
}
