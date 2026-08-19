import { FolderGit2, Image as ImageIcon, Star } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { RecentProject } from "@/lib/types"

import { ProjectStatusBadge } from "./project-status-badge"

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function RecentProjectsCard({ projects }: { projects: RecentProject[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent projects</CardTitle>
        <CardDescription>The five most recently created projects.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col">
        {projects.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No projects yet.</p>
        ) : (
          <ul className="flex flex-col">
            {projects.map((project, index) => (
              <li key={project.id}>
                <div className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FolderGit2 className="size-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">{project.name}</span>
                        {project.featured ? (
                          <Star
                            className="size-3 shrink-0 fill-amber-400 text-amber-400"
                            aria-label="Featured project"
                          />
                        ) : null}
                      </div>
                      <span className="truncate text-xs text-muted-foreground">
                        {project.techStack?.trim() || "No tech stack listed"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden items-center gap-1 text-xs text-muted-foreground md:inline-flex">
                      <ImageIcon className="size-3" aria-hidden="true" />
                      {project.mediaCount}
                    </span>
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {formatDate(project.createdAt)}
                    </span>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                </div>
                {index < projects.length - 1 ? <Separator /> : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
