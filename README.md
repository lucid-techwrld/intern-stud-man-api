# Student Management API

Node/Express + TypeScript + PostgreSQL (Redis optional) backend for the Auspify internship, Task 1.

## Setup
```bash
cp .env.example .env     # set DATABASE_URL (and REDIS_URL if you have Redis)
npm install
npm run migrate          # applies migrations/*.up.sql  (npm run migrate:down rolls back the last one)
npm run dev              # http://localhost:4000
npm test
```

## API
| Method | Path | Notes |
|---|---|---|
| GET | `/api/students?q=&course=&status=&page=&limit=` | `{data, meta:{page,limit,total}}` |
| GET | `/api/students/stats` | `{data:{total,active,graduated,courses}}` with `by_course`, cached 60s when Redis is on |
| GET | `/api/students/:id` | 404 if missing |
| POST | `/api/students` | 201 `{data}` |
| PUT | `/api/students/:id` | partial update allowed |
| DELETE | `/api/students/:id` | 204 |

Validation errors return `422 {success:false, message, errors:{field:message}}`.

## Structure
`modules/students` holds routes, controller, service, repository and DTOs (Zod). Shared pieces live in `middleware/`, `utils/`, `constants/`, `types/`, `config/`, `db/`. `server.ts` bootstraps the DB and Redis and shuts down gracefully.

## Deploy
```bash
npm install && npm run build   # build command
npm start                       # start command
npm run migrate:prod            # run once against the production database
```
Set `DATABASE_URL`, `CORS_ORIGIN` (your UI's URL) and optionally `REDIS_URL`. If the database is outside your host's private network, append `?sslmode=require` to `DATABASE_URL`.

## Authentication
Everything under `/api` except `/api/auth/*` requires an admin session. `POST /api/auth/login` with `{email, password}` sets an httpOnly cookie (8 hours); `POST /api/auth/logout` clears it and `GET /api/auth/me` returns the signed-in admin. Credentials come from `ADMIN_EMAIL` and `ADMIN_PASSWORD`, tokens are signed with `JWT_SECRET` (required in production), failed logins are rate limited, and state-changing requests must send `X-Requested-With: fetch`. Browsers must send credentials, and `CORS_ORIGIN` must be the UI's exact origin.
