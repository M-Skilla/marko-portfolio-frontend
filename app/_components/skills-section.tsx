import { Layers } from "lucide-react"

import { fetchPublic } from "@/lib/server-api"
import type { SkillTechnology } from "@/lib/types"

export async function SkillsSection() {
  let skills: SkillTechnology[] = []
  try {
    skills = await fetchPublic<SkillTechnology[]>("/api/skills")
  } catch {
    skills = []
  }

  if (skills.length === 0) return null

  const byCategory = new Map<string, SkillTechnology[]>()
  for (const skill of skills) {
    const category = skill.category?.trim() || "Other"
    const list = byCategory.get(category) ?? []
    list.push(skill)
    byCategory.set(category, list)
  }

  return (
    <section id="skills" className="mx-auto w-full max-w-4xl scroll-mt-16 px-6 py-16">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">Skills</h2>
      <div className="mt-8 flex flex-col gap-8">
        {[...byCategory.entries()].map(([category, items]) => (
          <div key={category} className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {items.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
                >
                  {skill.iconSvg ? (
                    <span
                      className="flex size-5 shrink-0 items-center justify-center text-foreground [&_svg]:size-5 [&_svg]:shrink-0"
                      dangerouslySetInnerHTML={{ __html: skill.iconSvg }}
                    />
                  ) : (
                    <Layers className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span>{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
