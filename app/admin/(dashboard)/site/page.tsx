import type { Metadata } from "next"
import { Suspense } from "react"

import { SiteSettingsSkeleton } from "./_components/site-settings-skeleton"
import { SiteSettingsView } from "./_components/site-settings-view"

export const metadata: Metadata = {
  title: "Site settings | Admin",
  description: "Manage the portfolio's site-wide content and links.",
}

export default function SiteSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold">Site settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage the portfolio&apos;s hero section, profile links, and SEO metadata.
        </p>
      </div>

      <Suspense fallback={<SiteSettingsSkeleton />}>
        <SiteSettingsView />
      </Suspense>
    </div>
  )
}
