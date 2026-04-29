# TODO

Outstanding work and advice for the project. Roughly ordered by impact.

---

## 1. Docker setup is dev-only — add a real production path

The current `docker-compose.yml` is a development environment, even though it accepts `NODE_ENV=production`. Setting that variable does not change behavior; it only mislabels the running stack.

Evidence in `docker-compose.yml`:
- Line 45 — `command: sh -c "npm run dev"` (backend runs `tsx watch`).
- Line 61 — `command: npm run dev -- --host` (frontend runs Vite dev server on 5173).
- Lines 40, 57 — bind-mounts `./backend/src` and `./frontend/src` into containers for live reload.
- `backend/Dockerfile` and `frontend/Dockerfile` — `npm install` (includes devDeps), no build step, `CMD` is `npm run dev`.

### What to add

- **Multi-stage Dockerfiles** for backend and frontend.
  - Backend: stage 1 installs all deps and runs `npm run build`; stage 2 starts from a slim base, copies `dist/` and `package*.json`, runs `npm ci --omit=dev`, `CMD ["node", "dist/index.js"]`.
  - Frontend: stage 1 builds static assets with `npm run build`; stage 2 is `nginx:alpine` serving `/usr/share/nginx/html`.
- **`docker-compose.prod.yml`** override file:
  - No source bind-mounts.
  - No `tsx watch` / Vite dev server.
  - `restart: unless-stopped` on every service.
  - Healthchecks on backend (e.g., `GET /api/health`) and frontend (Nginx default).
  - Frontend exposed on 80/443, not 5173.
  - Postgres port **not** published to the host (only reachable on the internal network).
- Use `npm ci --omit=dev` instead of `npm install` in the runtime stage.
- Add a non-root user (`USER node`) in the runtime stage.

---

## 2. Secrets and defaults are unsafe for anything but local dev

`docker-compose.yml` ships fallback defaults that will silently run in production if `.env` is missing:

- Line 8 — `POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}`.
- Line 33 — `JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key-for-development-only}`.

### What to do

- Drop the defaults for `JWT_SECRET` and `DB_PASSWORD` in the prod compose file so the stack **fails to start** if they are not set, instead of booting with a known-public secret.
- Validate required env vars at backend startup (`backend/src/config`) and exit non-zero if any are missing or shorter than a sane minimum (e.g., `JWT_SECRET.length < 32`).
- Consider Docker secrets or an external secret manager once deploying for real.
- Add `.env` to `.gitignore` (verify) and keep `.env.example` as the only committed template.

---

## 3. Operational gaps in `docker-compose.yml`

- **No `restart` policy** on `backend` or `frontend`. Add `restart: unless-stopped` for prod.
- **No healthcheck** on backend or frontend (Postgres has one). Backend needs a `/api/health` route returning 200; frontend can use the Nginx default page.
- **Postgres port is published** by default (line 13). For prod, drop the `ports:` block so the DB is only reachable from the compose network.
- `depends_on:` for the frontend (line 59) does **not** wait for backend readiness — only for it to start. Add a `condition: service_healthy` once backend has a healthcheck.
- The `./backend/src/db/schema.sql` init mount (line 11) only runs on **first** container start with an empty volume. Document that schema changes require migrations, not edits to `schema.sql`.

---

## 4. No migrations

Schema is applied once via `docker-entrypoint-initdb.d` and seeded with `npm run db:seed`. There is no migration tool, so any schema change after the first deploy has no path forward.

- Pick one: `node-pg-migrate`, `Knex`, `Prisma Migrate`, or raw SQL files run by a small migrator script.
- Add an `npm run migrate` script that the backend container runs on startup (or a separate one-shot service in compose).
- Move `schema.sql` content into the first migration so a fresh DB and a migrated DB end up identical.

---

## 5. Backend hardening

- Add a `/api/health` endpoint (DB ping + 200/503).
- Confirm `helmet`, CORS allowlist, and rate limiting are wired in for prod (rate limiter is mentioned in `CLAUDE.md` — verify it is registered globally, not just on auth).
- Centralized request logging (pino or similar) with request IDs.
- Refresh-token rotation and revocation list — currently `JWT_REFRESH_EXPIRES_IN` exists but storage/rotation strategy is worth a review.

---

## 6. Frontend production serving

- Replace the Vite dev server in prod with a static build served by Nginx.
- Inject `VITE_API_URL` at build time (Vite bakes env vars into the bundle), not runtime — or use a small runtime-config endpoint if the URL must vary per environment without rebuild.
- Add a basic Nginx config: gzip, long cache for hashed assets, no-cache for `index.html`, SPA fallback (`try_files $uri /index.html`).

---

## 7. Testing and CI

- Add a CI workflow (GitHub Actions) that runs `npm run build` for both packages, type-checks, and runs tests on every PR.
- Add an integration test that spins up Postgres via compose and hits a few endpoints end-to-end.

---

## 8. Smaller cleanups

- `docker-compose.yml` mounts `./backend/src` and `./frontend/src` as `:ro`. That's good for dev but means `tsx watch` / Vite cannot write `.tsbuildinfo` or HMR artifacts inside `src/`. Watch for warnings; if any tooling needs writes, drop the `:ro`.
- The `command: sh -c "npm run dev"` on line 45 doesn't need `sh -c` — `command: npm run dev` works the same.
- Pin Node to a specific minor (`node:20.18-alpine`) instead of `node:20-alpine` for reproducible builds.
- Add `.dockerignore` to both `backend/` and `frontend/` (exclude `node_modules`, `.env`, `dist`, `.git`) so build context stays small and never leaks local secrets into the image.
