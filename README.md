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

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## API Endpoints

| Route | Methods | Description |
|-------|---------|-------------|
| /api/auth | POST login, GET me | Authentication |
| /api/products | GET, POST, PUT, DELETE | Product management |
| /api/categories | GET, POST, PUT | Category management |
| /api/cart | GET, POST/PUT/DELETE items | Shopping cart |
| /api/transactions | GET, POST, POST :id/refund | Sales transactions |
| /api/inventory | GET, PUT, POST restock | Inventory control |
