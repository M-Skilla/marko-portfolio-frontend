import { Skeleton } from "@/components/ui/skeleton"

import { AchievementsTableSkeleton } from "./_components/achievements-table-skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <AchievementsTableSkeleton />
    </div>
  )
}
