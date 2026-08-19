import { ArrowUpRight, FolderGit2 } from "lucide-react"

import { ProjectStatusBadge } from "@/components/project-status-badge"
import { fetchPublic } from "@/lib/server-api"
import type { Project } from "@/lib/types"

function sortProjects(projects: Project[]): Project[] {
  return [...projects]
    .filter((project) => project.status !== "ARCHIVED")
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
}

export async function ProjectsSection() {
  let projects: Project[] = []
  try {
    projects = await fetchPublic<Project[]>("/api/projects")
  } catch {
    projects = []
  }

  const visible = sortProjects(projects)
  if (visible.length === 0) return null

  return (
    <section id="work" className="mx-auto w-full max-w-4xl scroll-mt-16 px-6 py-16">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">Selected work</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {visible.map((project) => (
          <article
            key={project.id}
            className="flex h-full flex-col gap-3 rounded-xl border bg-card p-4"
          >
            {project.featuredImageUrl ? (
              <div className="overflow-hidden rounded-lg border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.featuredImageUrl}
                  alt={project.name}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
              </div>
            ) : null}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading text-base font-semibold">{project.name}</h3>
              <ProjectStatusBadge status={project.status} />
            </div>
            {project.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            ) : null}
            {project.techStack ? (
              <p className="text-xs text-muted-foreground">{project.techStack}</p>
            ) : null}
            {project.projectUrl || project.repoUrl ? (
              <div className="mt-auto flex items-center gap-4 pt-1">
                {project.projectUrl ? (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Live
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </a>
                ) : null}
                {project.repoUrl ? (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    <FolderGit2 className="size-3.5" aria-hidden="true" />
                    Code
                  </a>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
