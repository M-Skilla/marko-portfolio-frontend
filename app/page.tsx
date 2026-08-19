import type { Metadata } from "next"
import { Suspense } from "react"

import { PortfolioHeader } from "./_components/portfolio-header"
import { PortfolioHero } from "./_components/portfolio-hero"
import { SkillsSection } from "./_components/skills-section"
import { ProjectsSection } from "./_components/projects-section"
import { HeroSkeleton, SectionSkeleton } from "./_components/portfolio-skeletons"

export const metadata: Metadata = {
  title: "Marko Portfolio",
  description: "Portfolio of Marko — full-stack developer.",
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
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-6 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Marko Portfolio</span>
        </div>
      </footer>
    </div>
  )
}

