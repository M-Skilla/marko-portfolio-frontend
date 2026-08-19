import { Skeleton } from "@/components/ui/skeleton"

import { SiteSettingsSkeleton } from "./_components/site-settings-skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-72" />
      </div>
      <SiteSettingsSkeleton />
    </div>
  )
}
