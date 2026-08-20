import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

import { AchievementForm } from "../_components/achievement-form"

export const metadata: Metadata = {
  title: "New achievement | Admin",
  description: "Add a new achievement in the Marko Portfolio admin.",
}

export default function NewAchievementPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold">New achievement</h1>
          <p className="text-sm text-muted-foreground">
            Add a new achievement to your portfolio.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/achievements" />}
          nativeButton={false}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to achievements
        </Button>
      </div>

      <AchievementForm />
    </div>
  )
}
