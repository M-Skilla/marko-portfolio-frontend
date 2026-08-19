import axios from "axios"
import { CircleAlert, ExternalLink, Globe, Info, Link2, Search } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { apiClient } from "@/lib/server-api"
import type { SiteSettings } from "@/lib/types"

import { SiteSettingsForm } from "./site-settings-form"

export async function SiteSettingsView() {
  let settings: SiteSettings | null = null
  let error: string | null = null
  let expired = false

  try {
    settings = await apiClient<SiteSettings>("/api/site")
  } catch (err) {
    expired = axios.isAxiosError(err) && err.response?.status === 401
    error = expired
      ? "Your session has expired. Please sign out and sign in again."
      : "Site settings could not be loaded right now. The form below starts empty."
  }

  if (expired) {
    return (
      <Alert variant="destructive">
        <CircleAlert aria-hidden="true" />
        <AlertTitle>Session expired</AlertTitle>
        <AlertDescription>
          Your session has expired. Please sign out and sign in again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <Alert variant="default">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Could not load site settings</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {settings ? <SiteSettingsOverview settings={settings} /> : null}

      <SiteSettingsForm settings={settings} />
    </div>
  )
}

/** Read-only summary of the currently stored site settings. */
function SiteSettingsOverview({ settings }: { settings: SiteSettings }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current settings</CardTitle>
        <CardDescription>
          These are the values currently served on your portfolio.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Section title="Hero" icon={<Globe aria-hidden="true" />}>
          <Row label="Title" value={settings.heroTitle} />
          <Row label="Subtitle" value={settings.heroSubtitle} />
        </Section>

        <Separator />

        <Section title="About" icon={<Info aria-hidden="true" />}>
          <Row label="About me" value={settings.aboutMe} />
        </Section>

        <Separator />

        <Section title="Profile links" icon={<Link2 aria-hidden="true" />}>
          <Row label="Résumé" value={settings.resumeUrl} href />
          <Row label="GitHub" value={settings.githubUrl} href />
          <Row label="Twitter / X" value={settings.twitterUrl} href />
          <Row label="LinkedIn" value={settings.linkedInUrl} href />
        </Section>

        <Separator />

        <Section title="SEO" icon={<Search aria-hidden="true" />}>
          <Row label="Meta title" value={settings.metaTitle} />
          <Row label="Meta description" value={settings.metaDescription} />
        </Section>
      </CardContent>
    </Card>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <span className="text-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0">{icon}</span>
        {title}
      </div>
      {children}
    </section>
  )
}

function Row({
  label,
  value,
  href = false,
}: {
  label: string
  value?: string
  href?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {value ? (
        href ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-0 items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline"
          >
            <span className="truncate">{value}</span>
            <ExternalLink className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
          </a>
        ) : (
          <span className="min-w-0 truncate text-right font-medium text-foreground">
            {value}
          </span>
        )
      ) : (
        <span className="text-muted-foreground">Not set</span>
      )}
    </div>
  )
}
