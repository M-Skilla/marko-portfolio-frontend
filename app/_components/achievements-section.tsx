import { Award } from "lucide-react"

import { fetchPublic } from "@/lib/server-api"
import { formatLongDate } from "@/lib/date-format"
import type { Achievement } from "@/lib/types"

function sortAchievements(items: Achievement[]): Achievement[] {
  return [...items].sort((a, b) => {
    const aTime = a.achievedDate ? new Date(a.achievedDate).getTime() : 0
    const bTime = b.achievedDate ? new Date(b.achievedDate).getTime() : 0
    return bTime - aTime
  })
}

export async function AchievementsSection() {
  let achievements: Achievement[] = []
  try {
    achievements = await fetchPublic<Achievement[]>("/api/achievements")
  } catch {
    achievements = []
  }

  const visible = sortAchievements(achievements)
  if (visible.length === 0) return null

  return (
    <section id="achievements" className="mx-auto w-full max-w-4xl scroll-mt-16 px-6 py-16">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">Achievements</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {visible.map((achievement) => {
          const date = formatLongDate(achievement.achievedDate)

          return (
            <article
              key={achievement.id}
              className="flex h-full flex-col gap-3 rounded-xl border bg-card p-4"
            >
              {achievement.imageUrl ? (
                <div className="overflow-hidden rounded-lg border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={achievement.imageUrl}
                    alt={achievement.name}
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Award className="size-5" aria-hidden="true" />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-base font-semibold">{achievement.name}</h3>
                {achievement.issuer || date ? (
                  <p className="text-xs text-muted-foreground">
                    {[achievement.issuer, date].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>

              {achievement.description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {achievement.description}
                </p>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
