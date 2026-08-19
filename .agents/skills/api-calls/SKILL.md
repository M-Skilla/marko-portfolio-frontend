---
name: api-calls
description: The API specification from the springboot backend and how every API call must be made in this next.js app (always with axios)
---

## How to make API calls
1. **First make external API calls in Next.js API routes** - API calls to external sources (e.g. the portfolio backend) must be made inside the `route.ts` files in `/api`.
2. **The frontend should then call the api routes to access external data** - API calls in the frontend pass through the Next.js API routes (`/api/...`); the frontend never talks to the backend directly.
3. **Every API call must use axios** - Never use the native `fetch` function for API calls.
   - Backend calls inside API routes use the shared axios instance (`api`) exported from `lib/api.ts`.
   - Frontend calls to the Next.js API routes use `axios` with relative URLs (`/api/...`).
4. **Proper error handling** - Wrap every API call in `try/catch`. In API routes, normalize errors from backend calls with `toApiRequestError` from `lib/api.ts` before responding with a proper HTTP status.

## Examples

### Backend call inside a Next.js API route (`route.ts`)
```ts
import { NextResponse } from "next/server"

import { api, toApiRequestError } from "@/lib/api"

export async function GET() {
  try {
    const { data } = await api.get<SkillTechnology[]>("/skills", {
      headers: { Authorization: `Bearer ${token}` },
    })
    return NextResponse.json(data)
  } catch (error) {
    const apiError = toApiRequestError(error)
    return NextResponse.json({ error: apiError.message }, { status: apiError.status })
  }
}
```

### Frontend call to a Next.js API route
```ts
import axios from "axios"

const { data } = await axios.post<{ token: string; username: string }>("/api/auth/login", {
  username,
  password,
})
```

## API Specification -> [API.md](../../../API.md)
You should follow the exact API specification from the API.md file
