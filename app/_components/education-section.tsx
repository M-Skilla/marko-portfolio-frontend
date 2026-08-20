import { GraduationCap } from "lucide-react"

import { fetchPublic } from "@/lib/server-api"
import { formatMonthYear } from "@/lib/date-format"
import type { FormalEducation } from "@/lib/types"

function sortEducation(entries: FormalEducation[]): FormalEducation[] {
  return [...entries].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )
}

/** Format the entry period as "Sep 2016 – Jun 2020" (or "… – Present"). */
function formatPeriod(entry: FormalEducation): string {
  const start = formatMonthYear(entry.startDate) ?? entry.startDate
  const end = entry.endDate ? (formatMonthYear(entry.endDate) ?? entry.endDate) : "Present"
  return `${start} – ${end}`
}

export async function EducationSection() {
  let education: FormalEducation[] = []
  try {
    education = await fetchPublic<FormalEducation[]>("/api/education")
  } catch {
    education = []
  }

  const visible = sortEducation(education)
  if (visible.length === 0) return null

  return (
    <section id="education" className="mx-auto w-full max-w-4xl scroll-mt-16 px-6 py-16">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">Education</h2>
      <div className="mt-8 flex flex-col gap-4">
        {visible.map((entry) => {
          const subject = [entry.degree, entry.fieldOfStudy].filter(Boolean).join(" · ")

          return (
            <article
              key={entry.id}
              className="flex h-full flex-col gap-3 rounded-xl border bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <GraduationCap className="size-4" aria-hidden="true" />
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h3 className="font-heading text-base font-semibold">
                      {entry.institution}
                    </h3>
                    {subject ? (
                      <p className="text-sm font-medium text-muted-foreground">{subject}</p>
                    ) : null}
                  </div>
                </div>
                <p className="shrink-0 text-sm text-muted-foreground">
                  {formatPeriod(entry)}
                </p>
              </div>

              {entry.location || entry.grade ? (
                <p className="text-xs text-muted-foreground">
                  {[entry.location, entry.grade ? `Grade: ${entry.grade}` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}

              {entry.description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {entry.description}
                </p>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
