# Marko Portfolio — Frontend

A modern, full-stack personal portfolio built with **Next.js 16 (App Router)**, **React 19** and **TypeScript**. The codebase ships two applications in one project:

- **Public portfolio site** — a landing page with hero, skills and selected-work sections rendered with Server Components for fast, SEO-friendly output.
- **Private admin CMS** — a JWT-protected dashboard for managing projects, skills, site-wide settings and image uploads.

The frontend never talks to the backend directly. Every external request goes through Next.js **API Routes** that proxy the **Marko Portfolio Spring Boot REST API** (`api.portfolio.markoskilla.com`), which uses **Bearer JWT authentication**. All media is stored in **Vercel Blob**.

---

## Table of contents

- [Features](#features)
- [Tech stack & tools](#tech-stack--tools)
- [Architecture & key strategies](#architecture--key-strategies)
  - [Server vs Client components](#server-vs-client-components)
  - [Route groups](#route-groups)
  - [API proxy pattern](#api-proxy-pattern)
  - [Authentication flow](#authentication-flow)
  - [Data fetching strategy](#data-fetching-strategy)
  - [Loading & streaming strategy](#loading--streaming-strategy)
- [Project structure](#project-structure)
- [Core libraries & logic](#core-libraries--logic)
  - [`lib/api.ts` — backend HTTP client](#libapits--backend-http-client)
  - [`lib/auth.ts` — session management](#libauthts--session-management)
  - [`lib/server-api.ts` — Server Component data access](#libserver-apits--server-component-data-access)
  - [`lib/types.ts` — shared domain models](#libtypests--shared-domain-models)
- [Feature deep-dive](#feature-deep-dive)
  - [Public portfolio](#public-portfolio)
  - [Admin authentication](#admin-authentication)
  - [Admin dashboard](#admin-dashboard)
  - [Projects management](#projects-management)
  - [Skills management](#skills-management)
  - [Site settings](#site-settings)
  - [Media uploads (Vercel Blob)](#media-uploads-vercel-blob)
- [Data models](#data-models)
- [API routes reference](#api-routes-reference)
- [Environment variables](#environment-variables)
- [Security considerations](#security-considerations)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Development conventions](#development-conventions)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Features

### Public portfolio

- Server-rendered landing page (SEO-friendly) with `generateMetadata` driven by backend site settings.
- Hero section with dynamic title, subtitle, about text and profile links (GitHub / LinkedIn / Twitter / Résumé).
- Skills section grouped by category, with inline SVG icons.
- Selected-work grid with featured project prioritisation, status badges, tech stack, live/code links and lazy-loaded images.
- Graceful degradation: sections hide themselves when data is unavailable and every fetch has a fallback.
- Skeleton loading states for instant perceived performance.
- Sticky header with in-page anchor navigation.

### Admin CMS

- JWT-based authentication with an `httpOnly` cookie — the token is never exposed to the browser.
- Route-level protection: unauthenticated visitors are redirected from the CMS to the login page.
- Dashboard with aggregate stats (projects, skills, media, site settings), project-status distribution, recent projects, skill categories and site-configuration status.
- Full CRUD for projects and skills with optimistic UX (spinners, inline errors, success feedback, destructive confirmation dialogs).
- Site-wide settings editor (hero content, profile links, SEO metadata).
- Reusable image upload widget backed by Vercel Blob with client- and server-side validation.

---

## Tech stack & tools

| Category | Technology | Version | Purpose |
|---|---|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) | 16.3.1 | Meta-framework, routing, RSC, API Routes |
| UI library | [React](https://react.dev) | 19.2.8 | Component model |
| Language | [TypeScript](https://www.typescriptlang.org) | ^5 | Type safety (strict mode) |
| Package manager | [pnpm](https://pnpm.io) | 11.21.0 | Dependency management (`packageManager` field) |
| Styling | [Tailwind CSS](https://tailwindcss.com) | ^4 | Utility-first CSS via `@tailwindcss/postcss` |
| Design system | [shadcn/ui](https://ui.shadcn.com) (`base-nova` style) | — | Copy-in components built on `@shadcn/react` + `@base-ui/react` primitives |
| Animation | `tw-animate-css` | ^1.4 | Tailwind animation utilities |
| HTTP client | [axios](https://axios.dev) | ^1.19 | All API calls (backend proxy + frontend calls to API routes) |
| Media storage | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) | `@vercel/blob` ^2.8 | Image hosting, public URLs |
| Icons | [lucide-react](https://lucide.dev) | ^1.31 | Icon library |
| Fonts | `next/font/google` | — | Geist + Geist Mono (self-hosted, auto-optimised) |
| JWT decoding | [jwt-decode](https://github.com/auth0/jwt-decode) | ^4.0 | Read username claim from session token |
| Class utilities | `clsx`, `tailwind-merge`, `class-variance-authority` | — | `cn()` helper and component variants |
| Charts | [Recharts](https://recharts.org) | 3.8.0 | Available via `components/ui/chart` (ready for future dashboards) |
| Linting | [ESLint](https://eslint.org) | ^9 | `eslint-config-next` (core-web-vitals + TypeScript) |
| Build/PostCSS | `@tailwindcss/postcss` | ^4 | Tailwind v4 PostCSS pipeline |

Additional headless primitives available through the shadcn component set: `@base-ui/react` (dialog, select, switch, tabs, toast, tooltip, etc.), `cmdk` (command palette), `input-otp`, `react-day-picker` (calendar), `react-resizable-panels`, `embla-carousel-react` (carousel), and `date-fns`.

## Architecture & key strategies

### Server vs Client components

The codebase follows the **React Server Component (RSC)** model promoted by the App Router:

- **Server Components by default** — pages, layouts, data-fetching views (`PortfolioHero`, `SkillsSection`, `ProjectsSection`, `DashboardStats`, `ProjectsList`, `SkillsList`, `SiteSettingsView`, …) are async server components. They fetch data, do grouping/sorting and render HTML on the server, keeping client bundles small.
- **Client Components only when interactivity is required** — every interactive component (forms, tables with delete actions, upload widget, logout button) starts with the `"use client"` directive.
- **Client components are pushed as far down the tree as possible.** Server pages compose thin wrappers and pass fetched data down to client leaf components (e.g. `ProjectsPage → ProjectsList (server) → ProjectsTable (client)`).

### Route groups

Two logical applications share one codebase and one domain:

```
app/
├── page.tsx            # Public portfolio landing page (app root)
└── admin/
    ├── (auth)/         # Route group — unauthenticated area
    │   └── login/      #   /admin/login
    └── (dashboard)/    # Route group — protected CMS area
        ├── page.tsx    #   /admin  (dashboard)
        ├── projects/   #   /admin/projects (+ /admin/projects/new)
        ├── skills/     #   /admin/skills (+ /new, /[id])
        └── site/       #   /admin/site
```

Route groups don't add URL segments; they are a way to scope layouts. The `(dashboard)` layout performs the **auth guard** (redirects to `/admin/login` when no session exists), so every nested page is protected by default. The `(auth)` layout renders the centered login screen and the login page redirects already-authenticated users to `/admin`.

### API proxy pattern

This is the central data-access strategy of the app:

1. **External API calls happen only inside Next.js API Routes** (`app/api/**/route.ts`). The frontend never talks to `api.portfolio.markoskilla.com` directly.
2. **The frontend calls the Next.js API routes** with relative URLs (e.g. `axios.post("/api/projects", …)`), so the browser only ever talks to the same-origin Next.js server.
3. **Every API call uses axios** — the shared instance from `lib/api.ts` for backend calls inside API routes, and plain `axios` with relative paths for browser→API-route calls.

```
Browser (React)
   │  axios (relative /api/...)
   ▼
Next.js API Route (route.ts)   ← validation, session check, auth header injected here
   │  axios (shared instance, Bearer token)
   ▼
Spring Boot REST API (api.portfolio.markoskilla.com)
```

**Why this pattern?**
- The backend JWT stays on the server — the browser never sees it.
- Sensitive logic (token attachment, payload normalisation, error mapping) is centralised and auditable.
- API routes act as a thin **BFF (Backend For Frontend)** — they validate requests, enforce auth via the httpOnly cookie, build clean payloads (dropping blank/optional fields), and normalise errors into `{ error: string }` responses with proper HTTP status codes.

### Authentication flow

Authentication is **session-cookie based on top of a JWT**:

1. `POST /api/auth/login` receives `{ username, password }`, proxies the backend `POST /auth/login`, and on success stores the returned JWT in an `httpOnly`, `sameSite: lax`, `secure` (in production) cookie named `admin_token`, with a 7-day max-age.
2. `GET /api/auth/session` reports `{ authenticated, username }` — used by the login page to redirect users who are already signed in.
3. Route protection is done in the `(dashboard)` layout via `getSession()` — reads the cookie and returns `{ token, username }` (username decoded from the JWT with `jwt-decode`, falling back to the `sub` claim). No session → `redirect("/admin/login")`.
4. `POST /api/auth/logout` deletes the cookie; the client then navigates to `/admin/login` and calls `router.refresh()`.
5. All mutating backend calls in API routes attach `Authorization: Bearer <session.token>` per request. The backend remains the source of truth for whether the token is still valid (expired/revoked tokens surface as `401`, which the UI handles with a "session expired" alert).

### Data fetching strategy

- **Public reads** — the landing page server components use `fetchPublic<T>(path)` from `lib/server-api.ts`, which calls the app's own public API routes using the request's host headers (`x-forwarded-host` / `host`, `x-forwarded-proto`). It uses the native `fetch` so Next.js can deduplicate identical calls within a render; the page stays dynamic because it reads request headers.
- **Authenticated reads** — admin server views use `apiClient<T>(path)` which forwards the incoming request's cookies to the internal API route so the session guard works end-to-end.
- **Client reads** — client components (forms that need skill lists, uploads, mutations) use `axios` against relative `/api/...` URLs.
- **All API routes that hit the backend are `export const dynamic = "force-dynamic"`** — they must never be statically cached.
- **Fail-safe defaults everywhere** — every server view wraps its fetch in `try/catch` and degrades gracefully (empty lists, `null` settings, skeleton/empty states) instead of crashing the page. `generateMetadata` falls back to hardcoded defaults when the site settings fetch fails.

### Loading & streaming strategy

The app maximises perceived performance with layered loading feedback:

- **`<Suspense>` boundaries** — each page section (hero, skills, projects, dashboard stats, tables, site settings) is wrapped in `Suspense` with a dedicated skeleton fallback, letting static parts of the page stream in immediately while data-heavy blocks resolve.
- **`loading.tsx` files** — every admin segment (`/admin`, `/admin/projects`, `/admin/skills`, `/admin/site`) defines a `loading.tsx` that reuses the same skeleton components for instant page transitions on hard navigation.
- **Skeleton components** mirror the final layout (cards, avatar-sized boxes, table rows) to avoid layout shift and give clear "content is coming" feedback.
- **In-form feedback** — submit buttons disable and show a `Spinner` + "Saving… / Signing in…" label; destructive actions track `pendingId` so only the affected row shows "Deleting…".

## Project structure

```
├── app/
│   ├── layout.tsx                      # Root layout — fonts, globals.css, dark theme
│   ├── page.tsx                        # Public landing page (generateMetadata + Suspense)
│   ├── globals.css                     # Tailwind v4 theme tokens, dark palette
│   ├── icon.svg                        # Site favicon (matches Logo)
│   ├── _components/                    # Public page sections (all server components)
│   │   ├── portfolio-header.tsx
│   │   ├── portfolio-hero.tsx
│   │   ├── skills-section.tsx
│   │   ├── projects-section.tsx
│   │   └── portfolio-skeletons.tsx     # HeroSkeleton / SectionSkeleton
│   ├── admin/
│   │   ├── (auth)/layout.tsx           # Centered auth layout
│   │   ├── (auth)/login/page.tsx       # Login page (redirects if already authed)
│   │   ├── (auth)/login/login-form.tsx # "use client" login form
│   │   └── (dashboard)/
│   │       ├── layout.tsx              # Auth guard + admin header/nav/logout
│   │       ├── page.tsx                # Dashboard
│   │       ├── loading.tsx             # Dashboard skeleton (instant transitions)
│   │       ├── logout-button.tsx       # "use client" logout
│   │       ├── _components/            # stat cards, status card, recent projects,
│   │       │                           # skills card, site card, skeleton, image-upload
│   │       ├── projects/               # list page + new project form
│   │       ├── skills/                 # list page + new/edit skill ([id])
│   │       └── site/                   # site settings editor
│   └── api/                            # Next.js API routes (the BFF layer)
│       ├── auth/{login,session,logout}/route.ts
│       ├── projects/route.ts, projects/[id]/route.ts
│       ├── skills/route.ts, skills/[id]/route.ts
│       ├── site/route.ts
│       ├── stats/route.ts              # Dashboard aggregation endpoint
│       └── uploads/route.ts            # Vercel Blob upload endpoint
├── components/
│   ├── ui/                             # shadcn/ui components (base-nova style)
│   ├── logo.tsx                        # Custom "M" monogram logo
│   └── project-status-badge.tsx        # Shared status badge + labels
├── hooks/use-mobile.ts                 # useIsMobile() hook
├── lib/
│   ├── api.ts                          # Shared axios instance + error helpers
│   ├── auth.ts                         # Session cookie read/write/clear + JWT decode
│   ├── server-api.ts                   # fetchPublic / apiClient helpers
│   ├── types.ts                        # Domain types + project statuses
│   └── utils.ts                        # cn() class merge helper
├── public/                             # Static assets (default Next.js SVGs)
├── API.md                              # Backend REST API reference (OpenAPI-derived)
├── AGENTS.md / CLAUDE.md               # AI-agent coding rules & conventions
├── components.json                     # shadcn/ui configuration
├── next.config.ts                      # Next.js config
├── postcss.config.mjs                  # Tailwind v4 PostCSS
├── eslint.config.mjs                   # ESLint 9 flat config (next core-web-vitals + ts)
├── tsconfig.json                       # Strict TS, path alias @/*
└── package.json                        # Scripts & dependencies (pnpm)
```

## Core libraries & logic

### `lib/api.ts` — backend HTTP client

The single gateway to the backend, used by every API route:

- **`api`** — a pre-configured axios instance with `baseURL` from `API_BASE_URL` (default `https://api.portfolio.markoskilla.com`), JSON content-type and a 15 s timeout. Tokens are attached per-request via headers, never stored on the instance.
- **`ApiRequestError`** — a normalised error carrying `status` and `body`, with a human-readable message extracted from the backend payload (`message` / `error` fields, or the raw string body).
- **`toApiRequestError(error)`** — converts any thrown value (axios errors, network failures, unknown) into an `ApiRequestError`. Axios `response.data` becomes the body; a missing response maps to status `500` with a "Could not reach the backend API" message.
- **`logApiRequestError(route, method, error, context)`** — structured server-side logging that records method, HTTP status, elapsed time and (optionally) the acting username. For axios errors it also logs connection metadata (code, url, baseURL, timeout, response status) — but **never the Authorization header**, so JWTs can't leak into logs.

### `lib/auth.ts` — session management

- `AUTH_COOKIE_NAME = "admin_token"` and `AUTH_SESSION_MAX_AGE = 7 days`.
- `getSession()` — reads the cookie, returns `{ token, username }` or `null`. The username is decoded from the JWT (`username ?? sub` claim) using `jwt-decode`.
- `setSession(token)` — writes the JWT into an `httpOnly`, `sameSite: lax`, `path: /`, `secure` (production only), 7-day cookie.
- `clearSession()` — deletes the cookie.

### `lib/server-api.ts` — Server Component data access

Helpers for server components to call the app's own API routes:

- **`apiClient<T>(path)`** — builds the route URL from the incoming request's `x-forwarded-host`/`x-forwarded-proto` headers (proxy-safe), forwards the request cookies, and fetches with **axios**. Used for authenticated reads inside the admin area so the session cookie reaches the API route.
- **`fetchPublic<T>(path)`** — the same URL construction but **without cookies**, using native `fetch` so Next.js can deduplicate identical calls in a single render. Used by the public landing page, which stays dynamic because it reads request headers.

### `lib/types.ts` — shared domain models

Central type definitions used across pages, forms, API routes and stats:

- `ProjectStatus` / `PROJECT_STATUSES` — a const tuple: `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `ARCHIVED`. Used for select options, badge styling and stats aggregation.
- `Project` / `ProjectRequest`, `SkillTechnology` / `SkillTechnologyRequest`, `ProjectMedia`, `SiteSettings` / `SiteSettingsRequest` — mirror the backend data models (see [Data models](#data-models)).
- `DashboardStats`, `RecentProject`, `CategoryCount` — the aggregated dashboard response shape.

## Feature deep-dive

### Public portfolio

The landing page (`app/page.tsx`) is a server component composed of four sections, each wrapped in `Suspense`:

1. **`PortfolioHeader`** — a sticky, blurred header with in-page anchors (`#work`, `#skills`).
2. **`PortfolioHero`** — fetches `/api/site` and renders `heroTitle`, `heroSubtitle` and `aboutMe`, then maps the four optional profile links (`githubUrl`, `linkedInUrl`, `twitterUrl`, `resumeUrl`) to outline buttons. Missing/empty links are filtered out.
3. **`SkillsSection`** — fetches `/api/skills`, groups skills by `category` (falling back to `"Other"`), and renders each category as a chip list. Skill icons are inline SVG rendered via `dangerouslySetInnerHTML` (data originates from the trusted admin).
4. **`ProjectsSection`** — fetches `/api/projects`, **excludes `ARCHIVED` projects**, sorts **featured first, then newest by `createdAt`**, and renders cards with an optional lazy-loaded cover image, `ProjectStatusBadge`, description, tech stack and `Live`/`Code` links.

**Logic highlights:**
- `generateMetadata()` pulls `metaTitle`/`metaDescription` from `/api/site` with hardcoded fallbacks so SEO metadata is always present.
- Every section degrades gracefully: fetch failure → empty list/`null`; empty content → section returns `null` (hidden entirely).
- The root layout hard-codes the **dark theme** (`className="dark"`), loads **Geist / Geist Mono** via `next/font` (with a dedicated `--font-heading` variable), and applies Tailwind v4 design tokens from `globals.css`.

### Admin authentication

- **Login page** (`/admin/login`) is a server component that calls `getSession()` and redirects to `/admin` when a session already exists. The `LoginForm` is a client component with client-side validation (both fields required), a show/hide password toggle, an inline destructive `Alert` for failures, and a spinner during submission. On success it does `router.push("/admin")` + `router.refresh()`.
- **Route protection** — the `(dashboard)/layout.tsx` reads the session and calls `redirect("/admin/login")` when missing, guarding every CMS page (dashboard, projects, skills, site).
- **Logout** — the client `LogoutButton` calls `POST /api/auth/logout`, then navigates to `/admin/login` and refreshes. It disables and shows "Signing out…" while pending.

### Admin dashboard

`GET /api/stats` is a **fault-tolerant aggregation endpoint**: it fetches `/skills`, `/projects` and `/site` in parallel with `Promise.all`, each via a `fetchModule` wrapper that captures per-module errors instead of throwing. The response always includes:

- `skills.total` + top 6 `categories` by count (uncategorized skills grouped under `"Uncategorized"`).
- `projects.total`, `byStatus` (every status present, defaulted to `0`), `featured`, and the 5 `recent` projects sorted by `createdAt` desc.
- `media.total` summed across projects.
- `site.configured` (hero title or meta title present) and per-link `profileLinks` booleans.
- an `errors[]` array describing any module that failed.

`DashboardStats` (server component) renders stat cards, the projects-by-status distribution, recent projects, skill categories and site-configuration status. A non-empty `errors[]` renders a warning alert; a `401` renders a "session expired" alert.

### Projects management

- **List page** (`/admin/projects`) — server `ProjectsList` fetches via `apiClient("/api/projects")`, handles `401` ("session expired") and generic failures with alerts, and passes data to the client `ProjectsTable`.
- **`ProjectsTable`** — renders name + slug, thumbnail (or placeholder), featured star, status badge, created date and a delete action. Deleting opens an **`AlertDialog` confirmation** describing the irreversible consequences; the confirm button tracks `pendingId` (disabled + "Deleting…") and calls `DELETE /api/projects/[id]`, then `router.refresh()` to re-render the server list. Errors surface in a destructive alert.
- **New project form** (`/admin/projects/new`) — client `ProjectForm`:
  - Validates `name` (required); renders per-field `FieldError`s.
  - Loads available skills from `/api/skills` on mount with a **cancellation flag** to avoid state updates after unmount (skills are optional — failure doesn't block the form).
  - Collects name, status (`Select` from `PROJECT_STATUSES`), tech stack, completed date (`datetime-local`), description, project URL, repo URL, featured image (`ImageUpload`), featured toggle and associated skills (checkboxes).
  - Submits via `axios.post("/api/projects", …)`; on success navigates to `/admin/projects` + `router.refresh()`; on failure shows a destructive alert and keeps the form state intact.

### Skills management

- **List page** (`/admin/skills`) — server `SkillsList` mirrors the projects list pattern and renders the client `SkillsTable`.
- **`SkillsTable`** — name + inline SVG icon (or placeholder), category, an Edit link and a delete `AlertDialog`. Same `pendingId` + `router.refresh()` pattern as projects.
- **Create/Edit** — a single client `SkillForm` in two modes (create or edit via an optional `skill` prop). Fields: name (required), category, and an SVG icon textarea. It calls `POST /api/skills` or `PUT /api/skills/[id]` accordingly. The edit page (`/admin/skills/[id]`) loads the skill server-side and renders a "could not load" alert if it was deleted.

### Site settings

`/admin/site` shows a read-only **overview card** (hero, about, profile links, SEO sections) and an editor form:

- `SiteSettingsView` (server) fetches settings via `apiClient("/api/site")` and renders the overview + `SiteSettingsForm`.
- `SiteSettingsForm` (client) is fully controlled with a defaulted empty form when no settings exist yet. All fields are optional; on submit it trims every value and `POST /api/site`. Success shows a "Site settings saved" alert and calls `router.refresh()` so the overview card reflects the new values.

### Media uploads (Vercel Blob)

The **`ImageUpload`** client widget is reused by the project form and is the only path for uploading images:

1. Client-side validation before upload: file type must be in `[jpeg, png, webp, gif, avif, svg+xml]` and ≤ 4 MB (mirrors the server limit).
2. Sends `multipart/form-data` with the `file` and a `folder` field (`projects`, `skills`, `site`; defaults to `projects`) to `POST /api/uploads`.
3. The upload route (auth-guarded) re-validates: a session is required, the folder must be in the allowlist, the MIME type must start with `image/`, and the size must be ≤ 4 MB (returning `413` otherwise — deliberately under Vercel's 4.5 MB function-body limit).
4. Filenames are **sanitised** (lowercased, path stripped, non-alphanumeric characters replaced, runs of `-` collapsed) and the file is stored with `put()` using `access: "public"` + `addRandomSuffix` so collisions are impossible.
5. The route returns `{ url, pathname }`; the widget reports the public URL back through `onChange` so the form saves the Blob URL with the project. The widget UI switches between idle / uploading / done / error states with replace-and-remove actions.

## Data models

All models are defined in `lib/types.ts` and mirror the backend API (`API.md`).

### `Project`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` (UUID) | |
| `name` | `string` | Required |
| `description` | `string?` | |
| `slug` | `string` | Unique, auto-generated by the backend |
| `techStack` | `string?` | |
| `createdAt` | `string` (ISO) | Auto-set by the backend |
| `projectUrl` / `repoUrl` | `string?` | Live & code links |
| `featuredImageUrl` | `string?` | Vercel Blob URL |
| `featured` | `boolean` | Drives portfolio ordering |
| `status` | `ProjectStatus` | `PLANNED \| IN_PROGRESS \| COMPLETED \| ON_HOLD \| ARCHIVED` |
| `completedAt` | `string?` (ISO) | |
| `skills` | `SkillTechnology[]` | Linked skills |
| `media` | `ProjectMedia[]` | Gallery media |

### `SkillTechnology`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` (UUID) | |
| `name` | `string` | Required, unique |
| `iconSvg` | `string?` | Inline SVG markup rendered in chips |
| `category` | `string?` | Grouping, e.g. "Backend" |

### `SiteSettings`

| Field | Type | Notes |
|---|---|---|
| `id` | `number` | |
| `heroTitle`, `heroSubtitle`, `aboutMe` | `string?` | Hero content |
| `resumeUrl`, `githubUrl`, `twitterUrl`, `linkedInUrl` | `string?` | Profile links |
| `metaTitle`, `metaDescription` | `string?` | SEO metadata |

### `ProjectMedia`

`id`, `mediaUrl` (required), `caption?`, `displayOrder?`.

### `DashboardStats`

Aggregated shape returned by `/api/stats`: `generatedAt`, `skills.{total, categories[]}`, `projects.{total, byStatus, featured, recent[]}`, `media.total`, `site.{configured, heroTitle, metaTitle, profileLinks}`, `errors[]`.

---

## API routes reference

All routes live in `app/api/**` and (except uploads) proxy the backend. Every route that touches the backend is `force-dynamic`. Errors are normalised to `{ error: string }` with an appropriate status code.

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/login` | `POST` | Public | Validates username/password, proxies backend login, sets `admin_token` cookie, returns `{ username }` |
| `/api/auth/session` | `GET` | Public | Returns `{ authenticated, username }` based on the session cookie |
| `/api/auth/logout` | `POST` | Public | Clears the session cookie |
| `/api/projects` | `GET` | Public | Lists projects (proxies backend `GET /projects`) |
| `/api/projects` | `POST` | Session | Creates a project; validates name + status enum; builds a clean payload |
| `/api/projects/[id]` | `DELETE` | Session | Deletes a project |
| `/api/skills` | `GET` | Public | Lists skills/technologies |
| `/api/skills` | `POST` | Session | Creates a skill (name required) |
| `/api/skills/[id]` | `GET` | Public | Fetches one skill |
| `/api/skills/[id]` | `PUT` | Session | Updates a skill (name required) |
| `/api/skills/[id]` | `DELETE` | Session | Deletes a skill |
| `/api/site` | `GET` | Public | Fetches site settings |
| `/api/site` | `POST` | Session | Updates site settings (all fields optional, trimmed) |
| `/api/stats` | `GET` | Public | Aggregates dashboard statistics (fault-tolerant) |
| `/api/uploads` | `POST` | Session | Uploads an image to Vercel Blob; returns `{ url, pathname }` |

> The public GET routes (`/projects`, `/skills`, `/skills/[id]`, `/site`, `/stats`) are served openly by the backend — no session required. Mutating routes require the session cookie, and the JWT is attached as a Bearer token server-side.

---

## Environment variables

| Variable | Required | Description | Default |
|---|---|---|---|
| `API_BASE_URL` | No | Base URL of the Marko Portfolio backend API (see [`API.md`](./API.md)) | `https://api.portfolio.markoskilla.com` |
| `BLOB_READ_WRITE_TOKEN` | No* | Long-lived Vercel Blob read-write token. Auto-provided when deployed on Vercel via OIDC (`BLOB_STORE_ID` / `VERCEL_OIDC_TOKEN`); required for local development / non-Vercel environments | — |

Create a local `.env.local` file with the values you need (it is git-ignored). On Vercel, Blob credentials are injected automatically; you can also run `vercel env pull` to fetch them locally.

## Security considerations

- **JWT never leaves the server.** The token returned by the backend is stored in an `httpOnly`, `sameSite: lax` cookie (`secure` in production). JavaScript cannot read it, mitigating XSS token theft.
- **Defence in depth.** The API routes check the session cookie before proxying mutating operations, while the backend independently verifies the Bearer token — a stolen cookie alone doesn't grant backend access.
- **No secrets in logs.** `logApiRequestError` deliberately excludes the Authorization header; logging includes only method, status, timing, username and non-sensitive axios metadata.
- **Upload hardening.** Only authenticated admins can upload; folders are restricted to an allowlist; MIME types are validated server-side; file sizes are capped at 4 MB; filenames are sanitised before becoming blob pathnames.
- **Request validation.** All JSON bodies are parsed defensively (invalid JSON → `400`), required fields are checked (project/skill name, login credentials), and enum fields are validated against `PROJECT_STATUSES`.
- **Payload normalisation.** Blank/optional fields are stripped before forwarding to the backend (`buildProjectRequest`, `buildSkillRequest`, `buildSiteSettingsRequest`), and dates are validated before being sent as ISO strings.
- **Auth-guarded routes** via the `(dashboard)` layout, so CMS pages redirect unauthenticated visitors.
- **Data hygiene.** Session expiry is surfaced gracefully (401 → "session expired" alert) rather than opaque errors.

---

## Getting started

### Prerequisites

- Node.js (the project uses **pnpm** as its package manager — `packageManager: pnpm@11.21.0`)
- Access to the backend API (local at `http://127.0.0.1:8080` or production at `https://api.portfolio.markoskilla.com`)
- A Vercel Blob store if you want to test image uploads locally

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy the needed values into `.env.local`:

```bash
API_BASE_URL=http://127.0.0.1:8080
# BLOB_READ_WRITE_TOKEN=your_blob_token   # only needed for uploads outside Vercel
```

### 3. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the public portfolio and [http://localhost:3000/admin/login](http://localhost:3000/admin/login) to access the CMS (sign in with a backend-created admin user).

---

## Available scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Start the development server with hot reload |
| `build` | `next build` | Production build with type checking & linting |
| `start` | `next start` | Serve the production build |
| `lint` | `eslint` | Run ESLint (flat config, core-web-vitals + TypeScript) |

## Development conventions

These conventions are codified in `AGENTS.md` (used by AI coding agents) and enforced through the repo structure:

- **Server Components by default**; add `"use client"` at the top of every client component.
- **Keep client components as far down the tree as possible** — server components compose and fetch, client components handle interaction.
- **All API requests go through Next.js API routes** (`route.ts`); the frontend never calls the backend directly.
- **Always use axios** for API calls (`lib/api.ts` shared instance for backend calls inside routes; `axios` with relative URLs from the browser).
- **Wrap every API call in `try/catch`** and normalise errors with `toApiRequestError` before responding with a proper HTTP status.
- **Wrap intensive blocks (charts, data grids, etc.) in `Suspense`** and provide `loading.tsx` for instant page transitions.
- **Two route groups** — `admin` (the CMS) and the main portfolio (at the app root).
- **All media that needs a URL uses Vercel Blob storage.**
- TypeScript strict mode is enabled; the path alias `@/*` maps to the repo root.
- Where a **URL-driven state** feature appears (filters in tables/data grids), it should live in the URL rather than component state.

### AI-agent skills bundled with the repo

- `.agents/skills/api-calls` — how external API calls must be made (always in API routes, always with axios, always error-normalised).
- `.agents/skills/shadcn` — shadcn/ui usage rules for the `base-nova` style.
- `.agents/skills/uploading-media` — Vercel Blob setup and upload patterns.

---

## Deployment

The app is designed for deployment on **Vercel**:

1. Push the repository and import it into Vercel (framework preset: **Next.js**).
2. Set the environment variables in the project settings (`API_BASE_URL`; Blob credentials are injected automatically when the Vercel Blob store is connected — `BLOB_STORE_ID` / `VERCEL_OIDC_TOKEN`, with `BLOB_READ_WRITE_TOKEN` as the static fallback).
3. Verify the backend API is reachable from the deployed environment and that its CORS configuration allows the app origin (in practice the proxy pattern means the browser only ever talks to the Next.js origin).

Commands:

```bash
pnpm build   # production build (runs type checking + ESLint)
pnpm start   # serve the production build
```

---

## Roadmap

- **Project detail pages / gallery** — the backend already models project media and slugs; a detail route (`/projects/[slug]`) with a media gallery (using the bundled `carousel` component) is the natural next step.
- **Dashboard charts** — Recharts is already available via `components/ui/chart` for richer analytics visualisations.
- **URL-driven filtering** on the admin tables (per the conventions) — e.g. `?status=` filters for projects.
- **Edit/update flows** for projects (the backend supports `PUT /projects/{id}`; the frontend currently implements create + delete).
- **Toast feedback** across admin mutations, using the bundled `toast` component.

---

## Related documentation

- [`API.md`](./API.md) — complete backend REST API reference (auth, skills, site settings, projects, media, data models).
- `AGENTS.md` / `CLAUDE.md` — AI-agent coding rules and standards for this repository.
