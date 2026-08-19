import { Skeleton } from "@/components/ui/skeleton"

export function HeroSkeleton() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 pt-24 pb-16">
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-20 w-full max-w-2xl" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </section>
  )
}

export function SectionSkeleton() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <Skeleton className="h-7 w-40" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </section>
  )
}
