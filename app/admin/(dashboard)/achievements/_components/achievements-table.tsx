"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { Award, CircleAlert, Pencil, Trash2 } from "lucide-react"

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
import { formatLongDate } from "@/lib/date-format"
import type { Achievement } from "@/lib/types"

export function AchievementsTable({ achievements }: { achievements: Achievement[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setPendingId(id)
    setError(null)

    try {
      await axios.delete(`/api/achievements/${id}`)
      router.refresh()
    } catch (err) {
      if (axios.isAxiosError<{ error?: string }>(err)) {
        setError(err.response?.data?.error ?? "The achievement could not be deleted.")
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
          <AlertTitle>Could not delete achievement</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Issuer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {achievements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No achievements yet. Click “Add achievement” to create your first one.
                </TableCell>
              </TableRow>
            ) : (
              achievements.map((achievement) => (
                <TableRow key={achievement.id}>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-2.5">
                      {achievement.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={achievement.imageUrl}
                          alt=""
                          className="size-9 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Award className="size-4" aria-hidden="true" />
                        </div>
                      )}
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium">{achievement.name}</span>
                        {achievement.description ? (
                          <span className="truncate text-xs text-muted-foreground">
                            {achievement.description}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {achievement.issuer ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatLongDate(achievement.achievedDate) ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/admin/achievements/${achievement.id}`} />}
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
                            <AlertDialogTitle>Delete achievement?</AlertDialogTitle>
                            <AlertDialogDescription>
                              “{achievement.name}” will be removed from your portfolio. This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              disabled={pendingId === achievement.id}
                              onClick={() => void handleDelete(achievement.id)}
                            >
                              {pendingId === achievement.id ? "Deleting…" : "Delete"}
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

