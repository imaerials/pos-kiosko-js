# Grocery POS

A fullstack Point of Sale application for grocery store operations. Mobile-responsive UI, role-based access, and a Coolify-ready Docker setup.

## Stack

- **Backend**: Express.js 5.x, Node.js 20, TypeScript, Prisma ORM
- **Frontend**: Vite, React 19, TypeScript, Tailwind CSS
- **Database**: PostgreSQL 16
- **State**: Zustand (client), React Query (server)

## First-Run Setup

You have two options to get an account:

- **Self-register**: open the app and click **Crear cuenta**. The first user to register is automatically promoted to `admin`; subsequent self-registrations get the `cashier` role.
- **Seed demo accounts** (handy for local dev/testing): run `npm run db:seed` from `backend/`. This creates `admin@pos.local`, `manager@pos.local`, and `cashier@pos.local` with the matching `admin123` / `manager123` / `cashier123` passwords, plus sample categories and products. Do **not** seed in production with these defaults — they're public.

### Controlling who can register

By default `/api/auth/register` is open. Set `ALLOWED_REGISTRATION_EMAILS` to a comma-separated allowlist to lock it down — only emails on the list will be accepted; everyone else gets `403 Forbidden`.

```
ALLOWED_REGISTRATION_EMAILS=owner@store.com,manager@store.com
```

Matching is case-insensitive and trims whitespace. Leave the variable empty/unset to keep registration open.

---

## Development

Runs Postgres in Docker, backend and frontend natively with hot reload.

**1. Start the database**

```bash
docker compose -f docker-compose.dev.yml up -d
```

**2. Install dependencies**

```bash
npm install                    # root (concurrently runner)
npm install --prefix backend
npm install --prefix frontend
```

**3. Configure environment**

```bash
cp backend/.env.example backend/.env   # required: DATABASE_URL, JWT_SECRET
```

**4. Push the Prisma schema and seed (first run)**

```bash
cd backend
npx prisma db push   # creates tables from prisma/schema.prisma
npm run db:seed      # demo users, categories, products, inventory
cd ..
```

**5. Start both services**

```bash
npm run dev          # API (cyan) + UI (magenta) concurrently
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

Run individually with `npm run dev:api` / `npm run dev:ui`.

---

## Production (Docker)

Builds the TypeScript backend, compiles the frontend into a static bundle served by nginx, and wires everything together. nginx proxies `/api/` to the backend, so only the frontend needs to be reachable from outside.

```bash
cp .env.example .env             # set JWT_SECRET (and DB creds if not using defaults)
docker compose up --build -d
```

The backend container automatically runs `prisma db push` on startup, so the schema is created/updated on first boot. No manual migration step needed.

If you want demo accounts in this environment too:

```bash
docker compose exec backend sh -c "node dist/db/seed.js"
```

(Or skip seeding and just register the first user via the UI to get an admin account.)

### Coolify deployment

The compose file is Coolify-friendly:

- Frontend `expose`s port 80 — Coolify's Traefik proxy routes the public domain to it.
- No host-port bindings (those would clash with Coolify's own proxy on `:80`).
- Backend env uses `DATABASE_URL` derived from the standard `DB_*` vars.

In the Coolify UI, set a domain on the `frontend` service and Coolify will handle TLS and routing.

For local Docker runs where you actually want a host port, add a `docker-compose.override.yml`:

```yaml
services:
  frontend:
    ports:
      - "${FRONTEND_PORT:-8080}:80"
```

Compose merges it automatically; Coolify ignores it.

---

## Environment Variables

| File | Used by | Purpose |
|------|---------|---------|
| `.env` (root) | `docker compose` | DB creds, `JWT_SECRET`, frontend port override |
| `backend/.env` | local backend | `DATABASE_URL`, `JWT_SECRET`, `PORT`, `NODE_ENV` |
| `frontend/.env` | Vite | `VITE_API_URL` if the backend isn't at `http://localhost:3001/api` |

All three are gitignored. In production the frontend calls `/api` (relative); nginx proxies to the backend, so `VITE_API_URL` isn't needed.

---

## Features

- **POS interface**: product grid, category filter, search by name/SKU/barcode, cart, checkout (cash + card), printable receipt
- **Mobile-responsive**: stacked layout with slide-up cart drawer on phones, full side-by-side on desktop
- **Transaction history**: list view with receipt detail modal, refund flow (manager+)
- **Inventory management**: stock levels, low-stock alerts, in-place edit (manager/admin)
- **Product management**: full CRUD with initial-stock setup (admin)
- **Finance dashboard**: revenue, COGS, gross profit, top products, payment-method breakdown (admin)
- **Auth**: email/password, JWT, self-registration (first user → admin)
- **Role-based access**: cashier (POS + own transactions), manager (+ inventory, all transactions, refunds), admin (+ products, finance)

---

## Project Structure

```
├── docker-compose.yml          # prod stack (Postgres + backend + nginx-served frontend)
├── docker-compose.dev.yml      # dev stack (Postgres only)
├── backend/
│   ├── Dockerfile              # multi-stage: prisma generate + tsc → slim node runtime
│   ├── prisma/schema.prisma    # source of truth for the DB schema
│   └── src/
│       ├── config/             # env + Prisma client
│       ├── middleware/         # JWT auth, error handler, rate limiter, validation
│       ├── routes/             # Express router definitions
│       ├── controllers/        # route handlers
│       ├── services/           # business logic
│       ├── repositories/       # Prisma queries
│       ├── db/seed.ts          # seeds users/categories/products/inventory
│       └── utils/              # custom errors, Zod validation schemas
└── frontend/
    ├── Dockerfile              # multi-stage: vite build → nginx:alpine
    ├── nginx.conf              # SPA fallback, /api/ proxy, static asset caching
    └── src/
        ├── components/         # ui/, layout/, products/, cart/, checkout/, receipt/
        ├── pages/              # LoginPage, RegisterPage, POSPage, TransactionsPage,
        │                       # InventoryPage, ProductsPage, FinancePage
        ├── store/              # Zustand (auth, cart)
        └── services/           # API client (axios + interceptors)
```

## API Endpoints

| Route | Methods | Auth |
|-------|---------|------|
| `/api/auth/login` | POST | Public |
| `/api/auth/register` | POST | Public (role forced server-side) |
| `/api/auth/me` | GET | JWT |
| `/api/products` | GET, POST, PUT, DELETE | GET public; mutations manager/admin |
| `/api/categories` | GET, POST, PUT | GET public; mutations manager/admin |
| `/api/cart` | GET, POST/PUT/DELETE items | JWT |
| `/api/transactions` | GET, POST, POST `:id/refund` | cashier (own), manager (all + refunds) |
| `/api/inventory` | GET, PUT, POST restock | manager/admin |
| `/api/finance/summary` | GET | admin |
