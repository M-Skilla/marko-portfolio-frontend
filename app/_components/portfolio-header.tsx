export function PortfolioHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between gap-4 px-6">
        <a href="#" className="truncate text-sm font-semibold tracking-tight">
          Marko Portfolio
        </a>
        <nav className="flex items-center gap-1" aria-label="Portfolio sections">
          <a
            href="#work"
            className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Work
          </a>
          <a
            href="#skills"
            className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Skills
          </a>
          <a
            href="#education"
            className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Education
          </a>
          <a
            href="#achievements"
            className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Achievements
          </a>
        </nav>
      </div>
    </header>
  )
}
