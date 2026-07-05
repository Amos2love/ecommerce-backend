# E-commerce Backend

Minimal Express + TypeScript backend for an e-commerce app.

## Tech stack
- Node.js + TypeScript
- Express
- Prisma + PostgreSQL
- Redis (session / cache)
- Cloudinary (image uploads)
- JWT auth, Zod validation
- Swagger (API docs)

## Quick start

Prerequisites: Node 18+, PostgreSQL, Redis

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file with required variables (examples below)

3. Run in development

```bash
npm run dev
```

4. Open API docs

Visit `http://localhost:3000/api-docs`

## Useful commands

- `npm run dev` — start dev server via `ts-node-dev`
- `npx prisma generate` — refresh Prisma client
- `npx prisma migrate dev` or `npx prisma migrate deploy` — run migrations

## Environment variables
At minimum, set the following in your `.env`:

- `DATABASE_URL` — Postgres connection string
- `REDIS_URL` — Redis connection string
- `CLIENT_URL` — frontend origin for CORS
- `PORT` — server port (defaults to 5000)
- `JWT_SECRET` — JWT signing secret
- `REFRESH_TOKEN_SECRET` — refresh token secret
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary creds
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` — SMTP creds

## Notes
- Swagger docs are generated from `src/routes` and served at `/api-docs`.
- Project has routes/controllers/services/middlewares separation and uses the generated Prisma client in `src/generated/prisma`.
- There are no tests or CI configured yet; add them before production use.

## Contributing
Open an issue or PR. For production deployment add build/start scripts and a Dockerfile.
