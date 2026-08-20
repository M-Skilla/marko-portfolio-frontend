import axios from "axios"
import { CircleAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { apiClient } from "@/lib/server-api"
import type { Achievement } from "@/lib/types"

import { AchievementsTable } from "./achievements-table"

export async function AchievementsList() {
  let achievements: Achievement[] = []
  let error: string | null = null
  let expired = false

  try {
    achievements = await apiClient<Achievement[]>("/api/achievements")
  } catch (err) {
    expired = axios.isAxiosError(err) && err.response?.status === 401
    error = expired
      ? "Your session has expired. Please sign out and sign in again."
      : "Achievements could not be loaded right now. Try again in a moment."
  }

  if (error) {
    return (
      <Alert variant={expired ? "destructive" : "default"}>
        <CircleAlert aria-hidden="true" />
        <AlertTitle>{expired ? "Session expired" : "Could not load achievements"}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return <AchievementsTable achievements={achievements} />
}
