# Grocery POS

A fullstack Point of Sale application for grocery store operations.

## Stack

- **Backend**: Express.js 5.x, Node.js, TypeScript
- **Frontend**: Vite, React 19, TypeScript, Tailwind CSS
- **Database**: PostgreSQL 16
- **State**: Zustand (client), React Query (server)

## Quick Start

```bash
docker compose up --build
```

Services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@pos.local | admin123 | admin |
| manager@pos.local | manager123 | manager |
| cashier@pos.local | cashier123 | cashier |

## Features

- **POS Interface**: Product grid with category filtering, cart management, checkout flow
- **Transaction History**: View all transactions with receipt details
- **Inventory Management**: Stock levels, low stock alerts, restocking (manager/admin)
- **Role-Based Access**: Cashiers process sales, managers handle inventory and refunds

## Project Structure

```
├── backend/           # Express.js API
│   └── src/
│       ├── config/       # Database, environment
│       ├── middleware/    # Auth, validation, rate limiting
│       ├── routes/       # API endpoints
│       ├── controllers/   # Route handlers
│       ├── services/     # Business logic
│       ├── repositories/ # Data access
│       └── db/           # Schema, seeds
├── frontend/          # React application
│   └── src/
│       ├── components/   # UI components
│       ├── pages/        # Route pages
│       ├── store/        # Zustand state
│       └── services/     # API client
└── docker-compose.yml   # Full stack orchestration
```

## Development

### Option 1: Docker (recommended)

Runs Postgres, backend, and frontend with hot reload. Source folders are bind-mounted, so edits in `backend/src` and `frontend/src` reload automatically.

```bash
docker compose up --build              # full stack
docker compose up postgres              # database only
docker compose up backend               # API only (needs postgres)
docker compose up frontend              # Vite dev server only

docker compose logs -f backend          # tail logs
docker compose down                     # stop
docker compose down -v                  # stop + wipe DB volume
```

Seed the database (after Postgres is up):

```bash
docker compose exec backend npm run db:seed         # products, categories, inventory
docker compose exec backend npm run db:seed:users   # demo users
```

### Option 2: Run services locally

Requires Node.js 20+ and a running Postgres 16 instance. Start Postgres with `docker compose up postgres` if you don't have one.

**Backend** (`http://localhost:3001`):

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_kiosko
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=dev-secret-change-me
```

Then:

```bash
npm run db:seed
npm run db:seed:users
npm run dev          # tsx watch
```

**Frontend** (`http://localhost:5173`):

```bash
cd frontend
npm install
npm run dev
```

If the backend is on a non-default URL, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

### Useful scripts

| Location | Command | Purpose |
|----------|---------|---------|
| backend  | `npm run dev` | tsx watch mode |
| backend  | `npm run build` / `npm start` | compile + run production build |
| backend  | `npm run db:seed` | seed products/categories/inventory |
| backend  | `npm run db:seed:users` | seed demo users |
| frontend | `npm run dev` | Vite dev server |
| frontend | `npm run build` | production build |
| frontend | `npm run preview` | preview built bundle |

## API Endpoints

| Route | Methods | Description |
|-------|---------|-------------|
| /api/auth | POST login, GET me | Authentication |
| /api/products | GET, POST, PUT, DELETE | Product management |
| /api/categories | GET, POST, PUT | Category management |
| /api/cart | GET, POST/PUT/DELETE items | Shopping cart |
| /api/transactions | GET, POST, POST :id/refund | Sales transactions |
| /api/inventory | GET, PUT, POST restock | Inventory control |
