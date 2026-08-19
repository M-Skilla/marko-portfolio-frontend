"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { CircleAlert, Image as ImageIcon, Star, Trash2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProjectStatusBadge } from "@/components/project-status-badge"
import type { Project } from "@/lib/types"

function formatDate(value?: string): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setPendingId(id)
    setError(null)

    try {
      await axios.delete(`/api/projects/${id}`)
      router.refresh()
    } catch (err) {
      if (axios.isAxiosError<{ error?: string }>(err)) {
        setError(err.response?.data?.error ?? "The project could not be deleted.")
      } else {
        setError("Unable to reach the server. Please try again.")
      }
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Could not delete project</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No projects yet. Click “Add project” to create your first one.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-2.5">
                      {project.featuredImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={project.featuredImageUrl}
                          alt=""
                          className="size-9 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                          <ImageIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                        </div>
                      )}
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-medium">{project.name}</span>
                          {project.featured ? (
                            <Star
                              className="size-3 shrink-0 fill-amber-400 text-amber-400"
                              aria-label="Featured project"
                            />
                          ) : null}
                        </div>
                        <span className="truncate text-xs text-muted-foreground">
                          {project.slug}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ProjectStatusBadge status={project.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(project.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
                        <Trash2 data-icon="inline-start" />
                        Delete
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogMedia>
                            <Trash2 aria-hidden="true" />
                          </AlertDialogMedia>
                          <AlertDialogTitle>Delete project?</AlertDialogTitle>
                          <AlertDialogDescription>
                            “{project.name}” and its associated media and skill links will be
                            permanently removed. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            disabled={pendingId === project.id}
                            onClick={() => void handleDelete(project.id)}
                          >
                            {pendingId === project.id ? "Deleting…" : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
