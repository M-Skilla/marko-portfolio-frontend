import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { CategoryCount } from "@/lib/types"

type SkillsCardProps = {
  categories: CategoryCount[]
  total: number
}

export function SkillsCard({ categories, total }: SkillsCardProps) {
  const maxCount = categories.reduce((max, item) => Math.max(max, item.count), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill categories</CardTitle>
        <CardDescription>
          {total === 0
            ? "No skills yet."
            : `Top ${categories.length} of ${total} ${total === 1 ? "skill" : "skills"} grouped by category.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {categories.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No skills yet.</p>
        ) : (
          categories.map(({ category, count }) => (
            <div key={category} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium">{category}</span>
                <span className="text-muted-foreground tabular-nums">{count}</span>
              </div>
              <Progress value={Math.round((count / maxCount) * 100)} aria-label={category} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
