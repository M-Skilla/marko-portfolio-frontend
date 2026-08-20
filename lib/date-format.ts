/**
 * Date helpers for the backend's `LocalDate` values, which serialize as
 * `YYYY-MM-DD` (no time component). Parsing date-only strings through the
 * `Date` constructor from its parts avoids UTC timezone shifts that `new
 * Date("YYYY-MM-DD")` and `parseISO` can introduce.
 */

export function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  return Number.isNaN(date.getTime()) ? null : date
}

/** Format a `YYYY-MM-DD` value as e.g. "Sep 2016". Returns `null` when unparsable. */
export function formatMonthYear(value?: string | null): string | null {
  if (!value) return null
  const date = parseDateOnly(value)
  if (!date) return null
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short" }).format(date)
}

/** Format a `YYYY-MM-DD` value as e.g. "May 12, 2025". Returns `null` when unparsable. */
export function formatLongDate(value?: string | null): string | null {
  if (!value) return null
  const date = parseDateOnly(value)
  if (!date) return null
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}
