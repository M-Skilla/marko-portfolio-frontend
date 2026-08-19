import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/types"

import { STATUS_LABELS } from "./project-status-badge"

type ProjectsStatusCardProps = {
  byStatus: Record<ProjectStatus, number>
  total: number
}

export function ProjectsStatusCard({ byStatus, total }: ProjectsStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects by status</CardTitle>
        <CardDescription>
          {total === 0
            ? "No projects yet — add your first project to see it here."
            : `Distribution of ${total} ${total === 1 ? "project" : "projects"} across lifecycle stages.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {PROJECT_STATUSES.map((status) => {
          const count = byStatus[status] ?? 0
          const percent = total === 0 ? 0 : Math.round((count / total) * 100)
          return (
            <Progress key={status} value={percent} aria-label={STATUS_LABELS[status]}>
              <ProgressLabel>{STATUS_LABELS[status]}</ProgressLabel>
              <span className="ml-auto text-sm text-muted-foreground tabular-nums">{count}</span>
            </Progress>
          )
        })}
      </CardContent>
    </Card>
  )
}
