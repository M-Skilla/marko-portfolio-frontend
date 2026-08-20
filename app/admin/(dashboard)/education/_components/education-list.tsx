import axios from "axios"
import { CircleAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { apiClient } from "@/lib/server-api"
import type { FormalEducation } from "@/lib/types"

import { EducationTable } from "./education-table"

export async function EducationList() {
  let education: FormalEducation[] = []
  let error: string | null = null
  let expired = false

  try {
    education = await apiClient<FormalEducation[]>("/api/education")
  } catch (err) {
    expired = axios.isAxiosError(err) && err.response?.status === 401
    error = expired
      ? "Your session has expired. Please sign out and sign in again."
      : "Education entries could not be loaded right now. Try again in a moment."
  }

  if (error) {
    return (
      <Alert variant={expired ? "destructive" : "default"}>
        <CircleAlert aria-hidden="true" />
        <AlertTitle>{expired ? "Session expired" : "Could not load education"}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return <EducationTable education={education} />
}
