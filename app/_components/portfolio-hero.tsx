import { ArrowDown, ArrowUpRight } from "lucide-react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { fetchPublic } from "@/lib/server-api"
import type { SiteSettings } from "@/lib/types"

const PROFILE_LINKS = [
  { key: "githubUrl", label: "GitHub" },
  { key: "linkedInUrl", label: "LinkedIn" },
  { key: "twitterUrl", label: "Twitter" },
  { key: "resumeUrl", label: "Résumé" },
] as const

export async function PortfolioHero() {
  let site: SiteSettings | null = null

  try {
    site = await fetchPublic<SiteSettings>("/api/site")
  } catch {
    site = null
  }

  const links: { label: string; href: string }[] = []
  for (const { key, label } of PROFILE_LINKS) {
    const href = site?.[key]
    if (href) links.push({ label, href })
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pt-24 pb-16">
      <div className="flex flex-col gap-4">
        <Logo className="size-14" />
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          {site?.heroTitle ?? "Portfolio"}
        </h1>
        {site?.heroSubtitle ? (
          <p className="text-lg text-muted-foreground">{site.heroSubtitle}</p>
        ) : null}
        {site?.aboutMe ? (
          <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            {site.aboutMe}
          </p>
        ) : null}
      </div>

      {links.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {links.map(({ label, href }) => (
            <Button
              key={label}
              variant="outline"
              size="sm"
              render={<a href={href} target="_blank" rel="noreferrer" />}
              nativeButton={false}
            >
              {label}
              <ArrowUpRight data-icon="inline-end" />
            </Button>
          ))}
        </div>
      ) : null}

      <a
        href="#work"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        View my work
        <ArrowDown className="size-4" aria-hidden="true" />
      </a>
    </section>
  )
}
