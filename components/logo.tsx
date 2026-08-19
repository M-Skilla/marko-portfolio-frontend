import { cn } from "@/lib/utils"

/**
 * Marko Portfolio logo — a geometric "M" monogram with a terminal cursor, in
 * the site's amber-on-black palette. Mirrors `app/icon.svg` (site favicon).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Marko Portfolio"
      className={cn("size-10", className)}
    >
      <rect x="3" y="3" width="58" height="58" rx="15" fill="#D97706" />
      <path
        d="M18 46V22l14 14 14-14v24"
        fill="none"
        stroke="#0A0908"
        strokeWidth={7.5}
        strokeLinejoin="miter"
      />
      <rect x="26" y="52" width="12" height="4" rx="2" fill="#0A0908" />
    </svg>
  )
}
