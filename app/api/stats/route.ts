import { NextResponse } from "next/server"

import { api, toApiRequestError } from "@/lib/api"
import { getSession } from "@/lib/auth"
import {
  PROJECT_STATUSES,
  type DashboardStats,
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

async function fetchModule<T>(path: string, token: string): Promise<ModuleResult<T>> {
  try {
    const { data, status } = await api.get<T>(path, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return { data, status }
  } catch (error) {
    const apiError = toApiRequestError(error)
    return { status: apiError.status }
  }
}

/**
 * GET /api/stats
 *
 * Aggregates dashboard statistics from the backend `/skills`, `/projects`, and
 * `/site` endpoints. Each module is fetched independently so one failing
 * module doesn't take down the whole dashboard.
 */
export async function GET() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const [skills, projects, site] = await Promise.all([
    fetchModule<SkillTechnology[]>("/skills", session.token),
    fetchModule<Project[]>("/projects", session.token),
    fetchModule<SiteSettings>("/site", session.token),
  ])

  if ([skills, projects, site].every((result) => result.status === 401)) {
    return NextResponse.json(
      { error: "Your session has expired. Please sign in again." },
      { status: 401 }
    )
  }

  const errors: string[] = []
  if (!skills.data) errors.push("Skills could not be loaded right now.")
  if (!projects.data) errors.push("Projects could not be loaded right now.")
  if (!site.data) errors.push("Site settings could not be loaded right now.")

  return NextResponse.json(buildStats(skills.data, projects.data, site.data, errors))
}

function buildStats(
  skills: SkillTechnology[] | undefined,
  projects: Project[] | undefined,
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
