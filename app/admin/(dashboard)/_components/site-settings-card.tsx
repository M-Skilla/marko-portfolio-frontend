import { Check, Globe, X } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { DashboardStats } from "@/lib/types"

type SiteSettingsCardProps = {
  site: DashboardStats["site"]
}

const PROFILE_LINKS: {
  key: keyof DashboardStats["site"]["profileLinks"]
  label: string
}[] = [
  { key: "github", label: "GitHub" },
  { key: "linkedIn", label: "LinkedIn" },
  { key: "twitter", label: "Twitter / X" },
  { key: "resume", label: "Résumé" },
]

export function SiteSettingsCard({ site }: SiteSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Site settings</CardTitle>
        <CardDescription>
          {site.configured
            ? "Your portfolio content is set up."
            : "No content configured yet — the site uses defaults."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
            <Globe className="size-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-medium">{site.heroTitle ?? "No hero title"}</span>
            <span className="truncate text-xs text-muted-foreground">
              {site.metaTitle ?? "No SEO meta title"}
            </span>
          </div>
        </div>

        <Separator />

        <ul className="flex flex-col">
          {PROFILE_LINKS.map(({ key, label }) => {
            const configured = site.profileLinks[key]
            return (
              <li key={key} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="text-muted-foreground">{label}</span>
                {configured ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-3.5" aria-hidden="true" />
                    Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <X className="size-3.5" aria-hidden="true" />
                    Not set
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
