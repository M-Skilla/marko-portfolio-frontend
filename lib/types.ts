export const PROJECT_STATUSES = [
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
  "ARCHIVED",
] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export type SkillTechnology = {
  id: string
  name: string
  iconSvg?: string
  category?: string
}

export type ProjectMedia = {
  id: string
  mediaUrl: string
  caption?: string
  displayOrder?: number
}

export type Project = {
  id: string
  name: string
  description?: string
  slug: string
  techStack?: string
  createdAt: string
  projectUrl?: string
  repoUrl?: string
  featuredImageUrl?: string
  featured: boolean
  status: ProjectStatus
  completedAt?: string
  skills?: SkillTechnology[]
  media?: ProjectMedia[]
}

export type SiteSettings = {
  id: number
  heroTitle?: string
  heroSubtitle?: string
  aboutMe?: string
  resumeUrl?: string
  githubUrl?: string
  twitterUrl?: string
  linkedInUrl?: string
  metaTitle?: string
  metaDescription?: string
}

export type CategoryCount = {
  category: string
  count: number
}

export type RecentProject = {
  id: string
  name: string
  slug: string
  status: ProjectStatus
  featured: boolean
  techStack?: string
  createdAt: string
  mediaCount: number
}

export type DashboardStats = {
  generatedAt: string
  skills: {
    total: number
    categories: CategoryCount[]
  }
  projects: {
    total: number
    byStatus: Record<ProjectStatus, number>
    featured: number
    recent: RecentProject[]
  }
  media: {
    total: number
  }
  site: {
    configured: boolean
    heroTitle: string | null
    metaTitle: string | null
    profileLinks: {
      github: boolean
      linkedIn: boolean
      twitter: boolean
      resume: boolean
    }
  }
  errors: string[]
}
