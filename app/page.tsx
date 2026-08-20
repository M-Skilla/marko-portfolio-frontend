import type { Metadata } from "next"
import { Suspense } from "react"

import { fetchPublic } from "@/lib/server-api"
import type { SiteSettings } from "@/lib/types"

import { PortfolioHeader } from "./_components/portfolio-header"
import { PortfolioHero } from "./_components/portfolio-hero"
import { SkillsSection } from "./_components/skills-section"
import { ProjectsSection } from "./_components/projects-section"
import { EducationSection } from "./_components/education-section"
import { AchievementsSection } from "./_components/achievements-section"
import { HeroSkeleton, SectionSkeleton } from "./_components/portfolio-skeletons"

const DEFAULT_TITLE = "Marko Portfolio"
const DEFAULT_DESCRIPTION = "Portfolio of Marko — full-stack developer."

/** Pull the page metadata from the site settings (`metaTitle`/`metaDescription`). */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const site = await fetchPublic<SiteSettings>("/api/site")
    return {
      title: site.metaTitle || DEFAULT_TITLE,
      description: site.metaDescription || DEFAULT_DESCRIPTION,
    }
  } catch {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    }
  }
}

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <PortfolioHeader />

      <main className="flex flex-1 flex-col">
        <Suspense fallback={<HeroSkeleton />}>
          <PortfolioHero />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <SkillsSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <ProjectsSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <EducationSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <AchievementsSection />
        </Suspense>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-6 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Marko Portfolio</span>
          <a
            href="/admin"
            aria-label="Admin"
            className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            admin
          </a>
        </div>
      </footer>
    </div>
  )
}

