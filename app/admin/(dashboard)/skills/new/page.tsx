import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

import { SkillForm } from "../_components/skill-form"

export const metadata: Metadata = {
  title: "New skill | Admin",
  description: "Create a new skill in the Marko Portfolio admin.",
}

export default function NewSkillPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold">New skill</h1>
          <p className="text-sm text-muted-foreground">Add a new skill to your portfolio.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/admin/skills" />}
          nativeButton={false}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to skills
        </Button>
      </div>

      <SkillForm />
    </div>
  )
}
