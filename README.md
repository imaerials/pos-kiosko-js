# Grocery POS

A fullstack Point of Sale application for grocery store operations.

## Stack

- **Backend**: Express.js 5.x, Node.js, TypeScript
- **Frontend**: Vite, React 19, TypeScript, Tailwind CSS
- **Database**: PostgreSQL 16
- **State**: Zustand (client), React Query (server)

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@pos.local | admin123 | admin |
| manager@pos.local | manager123 | manager |
| cashier@pos.local | cashier123 | cashier |

---

## Development (recommended)

Runs the DB in Docker, backend and frontend natively with hot reload.

**1. Start the database**

```bash
docker compose -f docker-compose.dev.yml up -d
```

**2. Install dependencies**

```bash
npm install                  # installs concurrently at the root
npm install --prefix backend
npm install --prefix frontend
```

**3. Configure environment**

```bash
cp .env.example .env                       # optional — defaults work out of the box
cp backend/.env.example backend/.env      # required for local backend
```

**4. Seed the database** (first run only)

```bash
npm run seed        # products, categories, inventory
npm run seed:users  # demo users
```

**5. Start both services**

```bash
npm run dev         # starts API (cyan) and UI (magenta) concurrently
```

Services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

Individual services:

```bash
npm run dev:api     # backend only
npm run dev:ui      # frontend only
```

---

## Production (Docker)

Builds the TypeScript backend, compiles the frontend into a static bundle served by nginx, and wires everything together. nginx proxies `/api/` to the backend, so only port 80 is exposed.

```bash
cp .env.example .env   # set JWT_SECRET at minimum
docker compose up --build -d
```

App is available at http://localhost (port 80 by default, override with `FRONTEND_PORT`).

Seed on first run:

```bash
docker compose exec backend node dist/server.js  # ensure backend is up
# then seed via the dev compose or a one-off container:
docker compose -f docker-compose.dev.yml run --rm postgres \
  psql -h localhost -U postgres -d pos_kiosko -f /dev/null
```

Or simply run the dev DB and seed scripts before switching to the prod stack:

```bash
docker compose -f docker-compose.dev.yml up -d
npm run seed && npm run seed:users
docker compose -f docker-compose.dev.yml down
docker compose up --build -d
```

---

## Environment Variables

| File | Used by | Purpose |
|------|---------|---------|
| `.env` (root) | `docker compose` | Overrides for both compose files (DB creds, JWT secret, ports) |
| `backend/.env` | `dotenv` in `backend/src/config/env.ts` | Required when running the backend locally |
| `frontend/.env` | Vite | `VITE_API_URL` if the backend isn't at `http://localhost:3001/api` |

All three are gitignored. In production the frontend always calls `/api` (relative), which nginx proxies to the backend — `VITE_API_URL` is not needed.

---

## Features

- **POS Interface**: Product grid with category filtering, cart management, checkout flow
- **Transaction History**: View all transactions with receipt details
- **Inventory Management**: Stock levels, low stock alerts, restocking (manager/admin)
- **Role-Based Access**: Cashiers process sales, managers handle inventory and refunds

---

## Project Structure

```
├── package.json          # root scripts (concurrently dev, seed shortcuts)
├── docker-compose.yml    # production stack (nginx frontend, compiled backend)
├── docker-compose.dev.yml # dev stack (DB only)
├── backend/
│   ├── Dockerfile        # multi-stage: tsc build → prod node image
│   └── src/
│       ├── config/       # database pool, environment validation
│       ├── middleware/   # JWT auth, error handler, rate limiter, validation
│       ├── routes/       # Express router definitions
│       ├── controllers/  # route handlers
│       ├── services/     # business logic
│       ├── repositories/ # data access (SQL queries)
│       └── db/           # schema.sql, seed.sql, seed scripts
└── frontend/
    ├── Dockerfile        # multi-stage: vite build → nginx:alpine
    ├── nginx.conf        # SPA fallback, /api/ proxy, static asset caching
    └── src/
        ├── components/   # UI components
        ├── pages/        # route pages
        ├── store/        # Zustand state
        └── services/     # API client
```

## API Endpoints

| Route | Methods | Auth |
|-------|---------|------|
| /api/auth | POST login, GET me | Public / JWT |
| /api/products | GET, POST, PUT, DELETE | manager/admin |
| /api/categories | GET, POST, PUT | manager/admin |
| /api/cart | GET, POST/PUT/DELETE items | JWT required |
| /api/transactions | GET, POST, POST :id/refund | cashier (own), manager (all) |
| /api/inventory | GET, PUT, POST restock | manager/admin |
