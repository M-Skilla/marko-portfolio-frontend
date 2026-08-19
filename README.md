This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment variables

| Variable        | Description                                                               | Default                  |
| --------------- | ------------------------------------------------------------------------- | ------------------------ |
| `API_BASE_URL`  | Base URL of the Marko Portfolio backend API (see [`API.md`](./API.md)).   | `http://127.0.0.1:8080`  |

Create a local `.env.local` file with the values you need. The variable is read by the Next.js API routes in `app/api/*` (the frontend never talks to the backend directly).

## Admin auth flow

- `POST /api/auth/login` — proxies the backend `POST /auth/login`, stores the returned JWT in an `httpOnly` cookie (`admin_token`), and returns the username.
- `GET /api/auth/session` — reports whether a session exists (used to redirect already-authenticated users away from the login page).
- `POST /api/auth/logout` — clears the session cookie.
- `GET /admin/login` — the CMS login page.
- `GET /admin` — the protected CMS dashboard (the `(dashboard)` route group redirects to `/admin/login` when no session cookie is present).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
