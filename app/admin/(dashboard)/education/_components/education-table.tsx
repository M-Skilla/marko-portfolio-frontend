"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { CircleAlert, GraduationCap, Pencil, Trash2 } from "lucide-react"

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
import { formatMonthYear } from "@/lib/date-format"
import type { FormalEducation } from "@/lib/types"

function formatPeriod(entry: FormalEducation): string {
  const start = formatMonthYear(entry.startDate) ?? entry.startDate
  const end = entry.endDate ? (formatMonthYear(entry.endDate) ?? entry.endDate) : "Present"
  return `${start} – ${end}`
}

export function EducationTable({ education }: { education: FormalEducation[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setPendingId(id)
    setError(null)

    try {
      await axios.delete(`/api/education/${id}`)
      router.refresh()
    } catch (err) {
      if (axios.isAxiosError<{ error?: string }>(err)) {
        setError(err.response?.data?.error ?? "The education entry could not be deleted.")
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
          <AlertTitle>Could not delete education entry</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Institution</TableHead>
              <TableHead>Programme</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {education.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No education entries yet. Click “Add education” to create your first one.
                </TableCell>
              </TableRow>
            ) : (
              education.map((entry) => {
                const programme = [entry.degree, entry.fieldOfStudy].filter(Boolean).join(" · ")
                const location = entry.location ?? entry.grade

                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <GraduationCap className="size-4" aria-hidden="true" />
                        </div>
                        <span className="truncate text-sm font-medium">{entry.institution}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {programme || location ? (
                        <div className="flex min-w-0 flex-col gap-0.5">
                          {programme ? <span className="truncate">{programme}</span> : null}
                          {location ? (
                            <span className="truncate text-xs text-muted-foreground">
                              {location}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatPeriod(entry)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          render={<Link href={`/admin/education/${entry.id}`} />}
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
                              <AlertDialogTitle>Delete education entry?</AlertDialogTitle>
                              <AlertDialogDescription>
                                “{entry.institution}” will be removed from your portfolio. This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                disabled={pendingId === entry.id}
                                onClick={() => void handleDelete(entry.id)}
                              >
                                {pendingId === entry.id ? "Deleting…" : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

