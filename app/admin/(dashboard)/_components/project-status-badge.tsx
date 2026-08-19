import { Badge } from "@/components/ui/badge"
import type { ProjectStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  ON_HOLD: "On hold",
  ARCHIVED: "Archived",
}

const STATUS_STYLES: Record<ProjectStatus, string> = {
  PLANNED: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-primary/10 text-primary",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ON_HOLD: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ARCHIVED: "bg-secondary text-muted-foreground",
}

export { STATUS_LABELS }

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="outline" className={cn("border-transparent", STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
