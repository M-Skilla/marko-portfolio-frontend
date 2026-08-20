import { redirect } from "next/navigation"
import Link from "next/link"
import { ShieldCheck, User } from "lucide-react"

import { getSession } from "@/lib/auth"

import { LogoutButton } from "./logout-button"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b px-6 py-3">
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
          <span>Marko Portfolio — Admin</span>
        </div>
        <nav className="flex items-center gap-1" aria-label="Admin sections">
          <Link
            href="/admin"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/projects"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Projects
          </Link>
          <Link
            href="/admin/skills"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Skills
          </Link>
          <Link
            href="/admin/education"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Education
          </Link>
          <Link
            href="/admin/achievements"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Achievements
          </Link>
          <Link
            href="/admin/site"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Site
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {session.username ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground">
              <User className="size-3.5 text-muted-foreground" aria-hidden="true" />
              {session.username}
            </span>
          ) : null}
          <LogoutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col p-6">{children}</main>
    </div>
  )
}
