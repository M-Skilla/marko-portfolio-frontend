import { NextResponse } from "next/server"

import { api, logApiRequestError, toApiRequestError } from "@/lib/api"
import {
  type Achievement,
  PROJECT_STATUSES,
  type DashboardStats,
  type FormalEducation,
  type Project,
  type ProjectStatus,
  type SiteSettings,
  type SkillTechnology,
} from "@/lib/types"

export const dynamic = "force-dynamic"

type ModuleResult<T> = {
  data?: T
  status: number
}

async function fetchModule<T>(path: string, startedAt: number): Promise<ModuleResult<T>> {
  try {
    const { data, status } = await api.get<T>(path)
    return { data, status }
  } catch (error) {
    const apiError = toApiRequestError(error)
    logApiRequestError("api/stats", `GET ${path}`, error, { startedAt })
    return { status: apiError.status }
  }
}

/**
 * GET /api/stats
 *
 * Aggregates dashboard statistics from the backend `/skills`, `/projects`,
 * `/education`, `/achievements`, and `/site` endpoints. Each module is fetched
 * independently so one failing module doesn't take down the whole dashboard.
 * The backend serves these GETs publicly, so no admin session is required.
 */
export async function GET() {
  const startedAt = Date.now()

  const [skills, projects, education, achievements, site] = await Promise.all([
    fetchModule<SkillTechnology[]>("/skills", startedAt),
    fetchModule<Project[]>("/projects", startedAt),
    fetchModule<FormalEducation[]>("/education", startedAt),
    fetchModule<Achievement[]>("/achievements", startedAt),
    fetchModule<SiteSettings>("/site", startedAt),
  ])

  const errors: string[] = []
  if (!skills.data) errors.push("Skills could not be loaded right now.")
  if (!projects.data) errors.push("Projects could not be loaded right now.")
  if (!education.data) errors.push("Education could not be loaded right now.")
  if (!achievements.data) errors.push("Achievements could not be loaded right now.")
  if (!site.data) errors.push("Site settings could not be loaded right now.")

  return NextResponse.json(
    buildStats(
      skills.data,
      projects.data,
      education.data,
      achievements.data,
      site.data,
      errors
    )
  )
}

function buildStats(
  skills: SkillTechnology[] | undefined,
  projects: Project[] | undefined,
  education: FormalEducation[] | undefined,
  achievements: Achievement[] | undefined,
  site: SiteSettings | undefined,
  errors: string[]
): DashboardStats {
  const skillList = skills ?? []
  const projectList = projects ?? []

  const categoryCounts = new Map<string, number>()
  for (const skill of skillList) {
    const category = skill.category?.trim() || "Uncategorized"
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
  }

  const byStatus = Object.fromEntries(
    PROJECT_STATUSES.map((status) => [status, 0])
  ) as Record<ProjectStatus, number>

  let featured = 0
  let mediaTotal = 0
  for (const project of projectList) {
    byStatus[project.status] = (byStatus[project.status] ?? 0) + 1
    if (project.featured) featured += 1
    mediaTotal += project.media?.length ?? 0
  }

  const recent = [...projectList]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((project) => ({
      id: project.id,
      name: project.name,
      slug: project.slug,
      status: project.status,
      featured: project.featured,
      techStack: project.techStack ?? undefined,
      createdAt: project.createdAt,
      mediaCount: project.media?.length ?? 0,
    }))

  return {
    generatedAt: new Date().toISOString(),
    skills: {
      total: skillList.length,
      categories: [...categoryCounts.entries()]
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6),
    },
    projects: {
      total: projectList.length,
      byStatus,
      featured,
      recent,
    },
    media: { total: mediaTotal },
    education: {
      total: education?.length ?? 0,
    },
    achievements: {
      total: achievements?.length ?? 0,
    },
    site: {
      configured: Boolean(site && (site.heroTitle || site.metaTitle)),
      heroTitle: site?.heroTitle ?? null,
      metaTitle: site?.metaTitle ?? null,
      profileLinks: {
        github: Boolean(site?.githubUrl),
        linkedIn: Boolean(site?.linkedInUrl),
        twitter: Boolean(site?.twitterUrl),
        resume: Boolean(site?.resumeUrl),
      },
    },
    errors,
  }
}
