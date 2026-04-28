# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Grocery POS (Point of Sale)** fullstack application for grocery store operations.

## Stack

- **Backend**: Express.js 5.x, Node.js, TypeScript
- **Frontend**: Vite, React 19.x, TypeScript, Tailwind CSS
- **Database**: PostgreSQL 16
- **State**: Zustand (client), React Query (server)

## Quick Start

```bash
# Start full stack ( Postgres + Backend + Frontend )
docker-compose up --build

# Or run services individually:
docker-compose up postgres          # Database only
docker-compose up backend          # API only
docker-compose up frontend         # Dev server only
```

Services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Development Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start with tsx watch (requires Postgres)
npm run build        # Compile TypeScript
npm start            # Run production build
npm run db:seed      # Seed database
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Vite dev server
npm run build        # Production build
```

## Seed Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@pos.local | admin123 | admin |
| manager@pos.local | manager123 | manager |
| cashier@pos.local | cashier123 | cashier |

## Architecture

### Backend (`backend/src/`)
```
config/       # Database pool, environment validation
middleware/   # JWT auth, error handler, rate limiter, validation
routes/       # Express router definitions
controllers/  # Route handlers (thin layer)
services/     # Business logic
repositories/ # Data access layer (SQL queries)
db/           # Schema.sql, seed.sql, seed.js
types/        # TypeScript interfaces
utils/        # Custom errors, Zod validation schemas
```

### Frontend (`frontend/src/`)
```
components/   # Reusable UI components (ui/, layout/, products/, cart/, checkout/, receipt/)
pages/        # Route-level components (POSPage, LoginPage, TransactionsPage, InventoryPage)
store/        # Zustand stores (authStore, cartStore)
services/     # API client with axios interceptors
hooks/        # Custom React hooks
types/        # TypeScript interfaces
```

### API Endpoints
| Route | Methods | Auth |
|-------|---------|------|
| /api/auth | POST login, GET me | Public / JWT |
| /api/products | GET, POST, PUT, DELETE | CRUD by manager/admin |
| /api/categories | GET, POST, PUT | CRUD by manager/admin |
| /api/cart | GET, POST/PUT/DELETE items | JWT required |
| /api/transactions | GET, POST, POST :id/refund | List own (cashier), all (manager), refund (manager) |
| /api/inventory | GET, PUT, POST restock | manager/admin |

### Database Schema
Tables: `users`, `categories`, `products`, `inventory`, `carts`, `cart_items`, `transactions`, `transaction_items`

Key design decisions:
- `transaction_items` snapshot product data at sale time for historical accuracy
- `inventory.quantity` decremented on transaction creation
- Roles: `cashier` (POS + own transactions), `manager` (+ inventory, all transactions), `admin` (+ user management)

## Role-Based Access

- **cashier**: POS operations, view own transactions
- **manager**: Inventory management, view all transactions, process refunds
- **admin**: Full access including product/category/user CRUD
