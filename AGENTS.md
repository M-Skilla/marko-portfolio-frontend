<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

## Tech Stack & Standards
- Framework: Next.js 16 (App Router), React, Typescript
- Styling: Tailwind.css, ShadcnUI
- API: api.portfolio.markoskilla.com


## Instructions
- Use Server Components by default, use Client components when interactive state or hooks are required.
- Add 'use client' directive at the top of every client component
- Use client component as far down the component tree as possible, always start with server components.
- All API requests should be called in api routes (route.ts) and the frontend should call the next js defined API. 
- Two separate route groups admin (for the CMS) and main for the actual portfolio
- The backend api uses Bearer authentication.
- Wrap intensive blocks (like charts, data grids and etc.) in Suspense 
- Use `loading.tsx` for instant page transitions
- Prioritize URL driven state for filters in tables and data grids
- Use of parallel and intercepting routes when necessary especially in the admin part of the app.


<!-- END:nextjs-agent-rules -->
