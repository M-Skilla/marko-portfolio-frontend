"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { CircleAlert, Pencil, Trash2, Wrench } from "lucide-react"

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
import type { SkillTechnology } from "@/lib/types"

export function SkillsTable({ skills }: { skills: SkillTechnology[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setPendingId(id)
    setError(null)

    try {
      await axios.delete(`/api/skills/${id}`)
      router.refresh()
    } catch (err) {
      if (axios.isAxiosError<{ error?: string }>(err)) {
        setError(err.response?.data?.error ?? "The skill could not be deleted.")
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
          <AlertTitle>Could not delete skill</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No skills yet. Click “Add skill” to create your first one.
                </TableCell>
              </TableRow>
            ) : (
              skills.map((skill) => (
                <TableRow key={skill.id}>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-2.5">
                      {skill.iconSvg ? (
                        <div
                          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0"
                          dangerouslySetInnerHTML={{ __html: skill.iconSvg }}
                        />
                      ) : (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Wrench className="size-4" aria-hidden="true" />
                        </div>
                      )}
                      <span className="truncate text-sm font-medium">{skill.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {skill.category ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/admin/skills/${skill.id}`} />}
                        nativeButton={false}
                      >
                        <Pencil data-icon="inline-start" />
                        Edit
                      </Button>
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
                            <AlertDialogTitle>Delete skill?</AlertDialogTitle>
                            <AlertDialogDescription>
                              “{skill.name}” will be removed from your portfolio, and projects
                              linked to it will be unlinked. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              disabled={pendingId === skill.id}
                              onClick={() => void handleDelete(skill.id)}
                            >
                              {pendingId === skill.id ? "Deleting…" : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
