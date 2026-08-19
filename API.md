# Marko Portfolio — API Reference

REST API for the Marko Portfolio site. This document describes every endpoint, the request/response payloads, and the data models. It is generated from the OpenAPI spec (`api.json`) plus the controller implementations.

---

## Table of contents

- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Skills & Technologies](#skills--technologies)
  - [Site settings](#site-settings)
  - [Projects](#projects)
  - [Project media](#project-media)
- [Data models](#data-models)
- [Common response codes](#common-response-codes)

---

## Base URLs

| Environment | Base URL |
|---|---|
| Local development | `http://127.0.0.1:8080` |
| Production | `https://api.portfolio.markoskilla.com` |

All endpoints below are relative to the base URL.

---

## Authentication

The API is protected with **JWT bearer tokens**. Every request to `/projects`, `/skills`, `/site`, and `/media` must include:

```
Authorization: Bearer <token>
```

Only the following paths are publicly accessible:

- `POST /auth/register`
- `POST /auth/login`
- `/h2-console/**` (dev only)
- Swagger UI / OpenAPI docs (`/swagger-ui/**`, `/v3/api-docs/**`)

Obtain a token by calling `POST /auth/login` (or `/auth/register`) and use the `token` value returned in the response. Requests without a valid token return `401 Unauthorized`.

---

## Endpoints

### Auth

#### `POST /auth/register`

Create a new admin user. The new user is automatically assigned the `ADMIN` role.

**Request body** — `RegisterRequest`

```json
{
  "username": "marko",
  "password": "s3cret"
}
```

**Response** — `200 Created`

```json
{
  "token": "<jwt-token>",
  "username": "marko"
}
```

#### `POST /auth/login`

Log in with an existing user and receive a JWT.

**Request body** — `LoginRequest`

```json
{
  "username": "marko",
  "password": "s3cret"
}
```

**Response** — `200 OK`

```json
{
  "token": "<jwt-token>",
  "username": "marko"
}
```

---

### Skills & Technologies

#### `GET /skills`

List all skills/technologies.

**Response** — `200 OK`

```json
[
  {
    "id": "3f2c1a4e-...",
    "name": "Spring Boot",
    "iconSvg": "<svg>...</svg>",
    "category": "Backend"
  }
]
```

#### `POST /skills`

Create a new skill/technology.

**Request body** — `SkillTechnologyRequest`

| Field | Type | Description |
|---|---|---|
| `name` | string | Skill name (required, unique) |
| `iconSvg` | string | Inline SVG markup for the icon |
| `category` | string | Grouping, e.g. "Frontend", "Backend" |

**Response** — `201 Created` — the created `SkillTechnology`.

#### `GET /skills/{id}`

Fetch a single skill by its UUID.

**Response** — `200 OK` with a `SkillTechnology`, or `404 Not Found` if no skill has that id.

#### `PUT /skills/{id}`

Update an existing skill.

**Request body** — same as `POST /skills` (`SkillTechnologyRequest`).

**Response** — `200 OK` with the updated `SkillTechnology`, or `404 Not Found` if the id doesn't exist.

#### `DELETE /skills/{id}`

Delete a skill by its UUID.

**Response** — `204 No Content` on success, or `404 Not Found` if the id doesn't exist.

---

### Site settings

Site-wide content for the portfolio (hero section, links, SEO metadata). There is a single settings row.

#### `GET /site`

Fetch the current site settings.

**Response** — `200 OK`

```json
{
  "id": 1,
  "heroTitle": "Hi, I'm Marko",
  "heroSubtitle": "Full-stack developer",
  "aboutMe": "I build things for the web.",
  "resumeUrl": "https://.../resume.pdf",
  "githubUrl": "https://github.com/marko",
  "twitterUrl": "https://twitter.com/marko",
  "linkedInUrl": "https://linkedin.com/in/marko",
  "metaTitle": "Marko — Portfolio",
  "metaDescription": "Portfolio of Marko."
}
```

#### `POST /site`

Update the site settings. Fields left out (or null) are updated based on the service's merge logic.

**Request body** — `SiteSettingsRequest` — all fields optional strings:

| Field | Description |
|---|---|
| `heroTitle` | Hero headline |
| `heroSubtitle` | Hero sub-headline |
| `aboutMe` | About section text |
| `resumeUrl` | Link to the résumé |
| `githubUrl` | GitHub profile URL |
| `twitterUrl` | Twitter/X profile URL |
| `linkedInUrl` | LinkedIn profile URL |
| `metaTitle` | SEO `<title>` |
| `metaDescription` | SEO meta description |

**Response** — `200 OK` with the updated `SiteSettings`.

---

### Projects

#### `GET /projects`

List all projects, including their associated skills and media.

**Response** — `200 OK`

```json
[
  {
    "id": "a1b2c3d4-...",
    "name": "Marko Portfolio",
    "description": "Personal portfolio site.",
    "slug": "marko-portfolio-8f2k1",
    "techStack": "Spring Boot, React",
    "createdAt": "2026-08-01T12:00:00",
    "projectUrl": "https://portfolio.markoskilla.com",
    "repoUrl": "https://github.com/marko/portfolio",
    "featuredImageUrl": "https://.../cover.png",
    "featured": true,
    "status": "COMPLETED",
    "completedAt": "2026-07-15T09:30:00",
    "skills": [
      {
        "id": "3f2c1a4e-...",
        "name": "Spring Boot",
        "iconSvg": "<svg>...</svg>",
        "category": "Backend"
      }
    ],
    "media": [
      {
        "id": "b9c8d7e6-...",
        "mediaUrl": "https://.../screenshot.png",
        "caption": "Home page",
        "displayOrder": 1
      }
    ]
  }
]
```

#### `POST /projects`

Create a new project. The `slug` is generated automatically from the project `name` (lowercased, non-alphanumeric characters stripped, spaces → dashes) with a random 5-char suffix appended.

**Request body** — `ProjectRequest`

| Field | Type | Description |
|---|---|---|
| `name` | string | Project name (required) |
| `description` | string | Long description |
| `techStack` | string | Comma-separated tech stack text |
| `projectUrl` | string | Live project URL |
| `repoUrl` | string | Source repository URL |
| `featuredImageUrl` | string | Cover image URL |
| `featured` | boolean | Whether to highlight the project |
| `status` | string | One of `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `ARCHIVED` |
| `completedAt` | date-time | When the project was completed (ISO 8601) |
| `skills` | array of string | Skill ids to associate with the project |
| `media` | array of `ProjectMediaRequest` | Media items to create for the project |

**Response** — `201 Created` with the created `Project` (including generated `id` and `slug`).

#### `GET /projects/{slug}`

Fetch a single project by its slug.

**Response** — `200 OK` with a `Project`, or `404 Not Found` if no project has that slug.

#### `DELETE /projects/{id}`

Delete a project by its UUID. Associated media and skill links are removed with it.

**Response** — `204 No Content` on success, or `404 Not Found` if the id doesn't exist.

---

### Project media

Images/screenshots attached to a project.

#### `GET /media/project/{projectId}`

List all media belonging to a project.

**Response** — `200 OK`

```json
[
  {
    "id": "b9c8d7e6-...",
    "mediaUrl": "https://.../screenshot.png",
    "caption": "Home page",
    "displayOrder": 1
  }
]
```

#### `POST /media/project/{projectId}`

Attach a new media item to a project.

**Request body** — `ProjectMediaRequest`

| Field | Type | Description |
|---|---|---|
| `mediaUrl` | string | URL of the image/video (required) |
| `caption` | string | Short caption |
| `displayOrder` | integer | Sort order for display |

**Response** — `201 Created` with the created `ProjectMedia`, or `404 Not Found` if the project doesn't exist.

#### `GET /media/{id}`

Fetch a single media item by its UUID.

**Response** — `200 OK` with a `ProjectMedia`, or `404 Not Found`.

#### `DELETE /media/{id}`

Delete a media item by its UUID.

**Response** — `204 No Content` on success, or `404 Not Found`.

---

## Data models

### `SkillTechnology`

| Field | Type | Notes |
|---|---|---|
| `id` | string (UUID) | |
| `name` | string | Unique |
| `iconSvg` | string | Inline SVG |
| `category` | string | |

### `SiteSettings`

| Field | Type |
|---|---|
| `id` | integer (int64) |
| `heroTitle`, `heroSubtitle`, `aboutMe` | string |
| `resumeUrl`, `githubUrl`, `twitterUrl`, `linkedInUrl` | string |
| `metaTitle`, `metaDescription` | string |

### `Project`

| Field | Type | Notes |
|---|---|---|
| `id` | string (UUID) | |
| `name` | string | |
| `description` | string | |
| `slug` | string | Unique, auto-generated |
| `techStack` | string | |
| `createdAt` | date-time | Auto-set |
| `projectUrl`, `repoUrl`, `featuredImageUrl` | string | |
| `featured` | boolean | |
| `status` | string enum | `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`, `ARCHIVED` |
| `completedAt` | date-time | |
| `skills` | array of `SkillTechnology` | |
| `media` | array of `ProjectMedia` | |

### `ProjectMedia`

| Field | Type | Notes |
|---|---|---|
| `id` | string (UUID) | |
| `mediaUrl` | string | |
| `caption` | string | |
| `displayOrder` | integer (int32) | |

### Request models

| Model | Fields |
|---|---|
| `SkillTechnologyRequest` | `name`, `iconSvg`, `category` |
| `SiteSettingsRequest` | `heroTitle`, `heroSubtitle`, `aboutMe`, `resumeUrl`, `githubUrl`, `twitterUrl`, `linkedInUrl`, `metaTitle`, `metaDescription` |
| `ProjectRequest` | `name`, `description`, `techStack`, `projectUrl`, `repoUrl`, `featuredImageUrl`, `featured`, `status`, `completedAt`, `skills` (string[]), `media` (`ProjectMediaRequest[]`) |
| `ProjectMediaRequest` | `mediaUrl`, `caption`, `displayOrder` |
| `RegisterRequest` | `username`, `password` |
| `LoginRequest` | `username`, `password` |

---

## Common response codes

| Code | Meaning |
|---|---|
| `200 OK` | Request succeeded, body contains the resource(s) |
| `201 Created` | Resource created, body contains the new resource |
| `204 No Content` | Resource deleted, no body |
| `401 Unauthorized` | Missing/invalid JWT token |
| `404 Not Found` | Resource (or related project/skill) not found |
| `500 Internal Server Error` | Unexpected server error |

---

## Example: end-to-end flow

```bash
# 1. Log in to get a token
curl -X POST http://127.0.0.1:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"marko","password":"s3cret"}'

# 2. Use the token for protected endpoints
curl http://127.0.0.1:8080/projects \
  -H "Authorization: Bearer <token>"

# 3. Create a skill
curl -X POST http://127.0.0.1:8080/skills \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Spring Boot","category":"Backend"}'
```
