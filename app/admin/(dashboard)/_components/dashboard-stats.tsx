import axios from "axios"
import { cookies, headers } from "next/headers"
import {
  CircleAlert,
  FolderKanban,
  Image as ImageIcon,
  Settings,
  Wrench,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { DashboardStats } from "@/lib/types"

import { ProjectsStatusCard } from "./projects-status-card"
import { RecentProjectsCard } from "./recent-projects-card"
import { SiteSettingsCard } from "./site-settings-card"
import { SkillsCard } from "./skills-card"
import { StatCard } from "./stat-card"

async function getDashboardStats(): Promise<DashboardStats> {
  const cookieStore = await cookies()
  const headerStore = await headers()

  const host =
    headerStore.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    headerStore.get("host") ??
    "localhost:3000"
  const proto = headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "http"
  const origin = `${proto}://${host}`

  const { data } = await axios.get<DashboardStats>(`${origin}/api/stats`, {
    headers: { Cookie: cookieStore.toString() },
  })

  return data
}

function pluralize(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`
}

export async function DashboardStats() {
  let stats: DashboardStats
  try {
    stats = await getDashboardStats()
  } catch (error) {
    const expired = axios.isAxiosError(error) && error.response?.status === 401

    return (
      <Alert variant="destructive">
        <CircleAlert aria-hidden="true" />
        <AlertTitle>
          {expired ? "Your session has expired" : "Could not load the dashboard"}
        </AlertTitle>
        <AlertDescription>
          {expired
            ? "Please sign out and sign in again to refresh your session."
            : "The dashboard could not be reached right now. Try again in a moment."}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {stats.errors.length > 0 ? (
        <Alert>
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Some modules are unavailable</AlertTitle>
          <AlertDescription>{stats.errors.join(" ")}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Projects"
          value={stats.projects.total}
          description={`${stats.projects.featured} featured`}
          icon={FolderKanban}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          label="Skills"
          value={stats.skills.total}
          description={`${stats.skills.categories.length} categories`}
          icon={Wrench}
          iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        />
        <StatCard
          label="Media"
          value={stats.media.total}
          description={`across ${pluralize(stats.projects.total, "project")}`}
          icon={ImageIcon}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Site settings"
          value={stats.site.configured ? "Ready" : "Setup"}
          description={stats.site.configured ? "Content is live" : "Not configured yet"}
          icon={Settings}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProjectsStatusCard byStatus={stats.projects.byStatus} total={stats.projects.total} />
        <RecentProjectsCard projects={stats.projects.recent} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SkillsCard categories={stats.skills.categories} total={stats.skills.total} />
        <SiteSettingsCard site={stats.site} />
      </div>
    </div>
  )
}
