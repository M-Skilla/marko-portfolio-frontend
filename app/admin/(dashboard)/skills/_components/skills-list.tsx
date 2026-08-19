import axios from "axios"
import { CircleAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { apiClient } from "@/lib/server-api"
import type { SkillTechnology } from "@/lib/types"

import { SkillsTable } from "./skills-table"

export async function SkillsList() {
  let skills: SkillTechnology[] = []
  let error: string | null = null
  let expired = false

  try {
    skills = await apiClient<SkillTechnology[]>("/api/skills")
  } catch (err) {
    expired = axios.isAxiosError(err) && err.response?.status === 401
    error = expired
      ? "Your session has expired. Please sign out and sign in again."
      : "Skills could not be loaded right now. Try again in a moment."
  }

  if (error) {
    return (
      <Alert variant={expired ? "destructive" : "default"}>
        <CircleAlert aria-hidden="true" />
        <AlertTitle>{expired ? "Session expired" : "Could not load skills"}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return <SkillsTable skills={skills} />
}
