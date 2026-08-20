import axios from "axios"
import {
  CircleAlert,
  FolderKanban,
  GraduationCap,
  Image as ImageIcon,
  Settings,
  Trophy,
  Wrench,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { apiClient } from "@/lib/server-api"
import type { DashboardStats } from "@/lib/types"

import { ProjectsStatusCard } from "./projects-status-card"
import { RecentProjectsCard } from "./recent-projects-card"
import { SiteSettingsCard } from "./site-settings-card"
import { SkillsCard } from "./skills-card"
import { StatCard } from "./stat-card"

async function getDashboardStats(): Promise<DashboardStats> {
  return apiClient<DashboardStats>("/api/stats")
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
          label="Education"
          value={stats.education.total}
          description={pluralize(stats.education.total, "entry")}
          icon={GraduationCap}
          iconClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
        />
        <StatCard
          label="Achievements"
          value={stats.achievements.total}
          description={`${stats.achievements.total === 0 ? "no awards yet" : "awards & honors"}`}
          icon={Trophy}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
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
