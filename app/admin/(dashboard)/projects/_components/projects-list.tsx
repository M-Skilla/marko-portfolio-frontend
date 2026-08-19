import axios from "axios"
import { CircleAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { apiClient } from "@/lib/server-api"
import type { Project } from "@/lib/types"

import { ProjectsTable } from "./projects-table"

export async function ProjectsList() {
  let projects: Project[] = []
  let error: string | null = null
  let expired = false

  try {
    projects = await apiClient<Project[]>("/api/projects")
  } catch (err) {
    expired = axios.isAxiosError(err) && err.response?.status === 401
    error = expired
      ? "Your session has expired. Please sign out and sign in again."
      : "Projects could not be loaded right now. Try again in a moment."
  }

  if (error) {
    return (
      <Alert variant={expired ? "destructive" : "default"}>
        <CircleAlert aria-hidden="true" />
        <AlertTitle>{expired ? "Session expired" : "Could not load projects"}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return <ProjectsTable projects={projects} />
}
