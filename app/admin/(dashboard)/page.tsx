import type { Metadata } from "next"
import { Suspense } from "react"

import { getSession } from "@/lib/auth"

import { DashboardSkeleton } from "./_components/dashboard-skeleton"
import { DashboardStats } from "./_components/dashboard-stats"

export const metadata: Metadata = {
  title: "Dashboard | Admin",
  description: "Marko Portfolio admin dashboard.",
}

export default async function AdminDashboardPage() {
  const session = await getSession()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {session?.username ? (
            <>
              Overview of your portfolio content, welcome back{" "}
              <strong className="font-semibold text-foreground">{session.username}</strong>.
            </>
          ) : (
            "Overview of your portfolio content."
          )}
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardStats />
      </Suspense>
    </div>
  )
}

