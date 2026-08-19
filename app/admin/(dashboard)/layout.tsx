import { redirect } from "next/navigation"
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
