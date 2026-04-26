# Full Stack E-commerce Order System

Senior-level take-home implementation using a Turborepo monorepo.

- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript + Prisma + Swagger
- **Database**: MySQL
- **Monorepo**: Turborepo + pnpm workspaces

---

## 1) Setup and Run (Including DB / Migrations)

### Prerequisites

- Node.js `>= 18`
- pnpm `>= 9`
- MySQL running locally (or Docker)

### Install dependencies

```bash
pnpm install
```

### Environment setup

1. Backend:
   - Copy `apps/backend/.env.example` to `apps/backend/.env`
2. Frontend:
   - Copy `apps/frontend/.env.example` to `apps/frontend/.env` (optional, defaults are present)

Default important backend env values:

- `DATABASE_URL=mysql://root:root@localhost:3306/ecommerce_order_system`
- `JWT_SECRET=...`
- `JWT_EXPIRES_IN=7d`
- `PORT=4000`
- `CORS_ALLOWED_ORIGINS=http://localhost:5173`

### Database setup (Prisma)

From repo root:

```bash
pnpm db:migrate
pnpm db:seed
```

This will:

- apply schema migrations
- seed initial data (admin user + categories/products)

### Run the project

```bash
pnpm dev
```

Endpoints:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`
- Swagger UI: `http://localhost:4000/api-docs`

### Useful verification commands

```bash
pnpm check-types
pnpm --filter backend test
pnpm --filter frontend test
```

---

## 2) Dockerized Run (MySQL + Backend + Frontend)

The repo includes:

- `docker-compose.yml`
- `Dockerfile.backend`
- `Dockerfile.frontend`

Start all services:

```bash
docker compose up --build
```

Ports:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Swagger: `http://localhost:4000/api-docs`
- MySQL: `localhost:3306`

---

## 3) Design Decisions and Assumptions

### Monorepo decisions

- Kept frontend/backend in `apps/`, reusable logic in `packages/`.
- Introduced shared packages for consistency and reuse:
  - `@repo/types`, `@repo/constants`, `@repo/utils`, `@repo/api-contracts`, `@repo/auth`, `@repo/errors`, `@repo/env`.
- Backend app-level env access is a thin wrapper over shared `@repo/env` loader.

### Backend decisions

- **API style**: REST with consistent envelope `{ success, message, data }`.
- **Validation**: Joi schema validation per module.
- **Auth**: JWT-based auth with role-based route guards.
- **Error handling**: centralized middleware + shared error codes.
- **Order consistency**:
  - Transactional order placement.
  - Pessimistic locking (`FOR UPDATE`) to prevent overselling under concurrency.
- **Soft delete**: applied to relevant entities (e.g., products), and filtered in list/read operations.

### Frontend decisions

- Feature-based organization under `apps/frontend/src/features/*`.
- API calls isolated in service/client layers (not in presentational components).
- Route guards enforce role-based navigation.
- React Query for async server state and mutation flows.

### Assumptions

- Single MySQL instance is sufficient for this assignment scope.
- JWT access token only (no refresh token workflow for now).
- `unitPrice` in `order_items` is a snapshot at checkout time.
- Admin panel is intentionally focused on assignment-required operations.

### Discussion & Trade-offs

#### Why transactions matter for order placement

Order placement is a multi-step write flow: validate cart, validate stock, create order, create order items, decrement stock, clear cart.

Without a transaction:

- stock could be decremented but order creation might fail (inventory corruption)
- order could be created but cart might not clear (duplicate checkout risk)
- concurrent requests could partially commit inconsistent state

Using a DB transaction guarantees all-or-nothing behavior and keeps order, stock, and cart data consistent.

#### Optimistic vs pessimistic locking (inventory)

- **Optimistic locking** (version checks/retry) can provide higher throughput but requires explicit retry handling and is more complex to reason about under heavy checkout contention.
- **Pessimistic locking** (`SELECT ... FOR UPDATE`) serializes conflicting stock updates and is simpler/safer for this assignment’s correctness-first requirement.

**Chosen approach**: pessimistic locking in order placement.

Reason:

- prevents overselling deterministically during concurrent checkout
- keeps failure mode explicit (`INSUFFICIENT_STOCK`) without retry storms
- simpler operational behavior for a single-DB transactional service

#### Database indexing strategy

Implemented indexes are focused on query patterns used by the app:

- `users.email` unique index for login lookup
- `categories.name` unique index for stable category identity
- `products.name` for search
- `products.category_id` and `products.category_id + deleted_at` for filtered product listing with soft delete
- `orders.user_id` for order history per user
- `order_items(order_id, product_id)` unique + `order_items.product_id` index for integrity and product-level lookups
- `cart_items(cart_id, product_id)` unique + `cart_items.product_id` index for cart integrity and joins
- `deleted_at` indexes on soft-deleted entities to keep active-record queries fast

---

## 4) Database Schema Diagram (ASCII)

```text
+------------------+        1        1      +------------------+
|      users       |------------------------|      carts       |
+------------------+                        +------------------+
| id (PK)          |                        | id (PK)          |
| first_name       |                        | user_id (FK, UQ) |
| last_name        |                        | created_at       |
| email (UQ)       |                        | updated_at       |
| password         |                        +------------------+
| role             |                                 |
| created_at       |                                 | 1
| updated_at       |                                 |
| deleted_at       |                                 | N
+------------------+                        +------------------+
        | 1                                  |    cart_items    |
        |                                    +------------------+
        | N                                  | id (PK)          |
+------------------+                         | cart_id (FK)     |
|      orders      |                         | product_id (FK)  |
+------------------+                         | quantity         |
| id (PK)          |                         | created_at       |
| user_id (FK)     |                         | updated_at       |
| status           |                         | UQ(cart_id,      |
| total_amount     |                         |    product_id)   |
| created_at       |                         +------------------+
| updated_at       |
| deleted_at       |
+------------------+
        |
        | 1
        | N
+------------------+         N         1     +------------------+
|    order_items   |------------------------|     products      |
+------------------+                        +------------------+
| id (PK)          |                        | id (PK)          |
| order_id (FK)    |                        | name             |
| product_id (FK)  |                        | description      |
| quantity         |                        | image_url        |
| unit_price       |  <-- price snapshot    | price            |
| created_at       |                        | stock            |
| updated_at       |                        | category_id (FK) |
| UQ(order_id,     |                        | created_at       |
|    product_id)   |                        | updated_at       |
+------------------+                        | deleted_at       |
                                            +------------------+
                                                     |
                                                     | N
                                                     | 1
                                            +------------------+
                                            |    categories    |
                                            +------------------+
                                            | id (PK)          |
                                            | name (UQ)        |
                                            | description      |
                                            | created_at       |
                                            | updated_at       |
                                            +------------------+
```

---

## 5) High-Level Repository Structure

```text
apps/
  backend/   # Express + Prisma + Swagger
  frontend/  # React + Vite
packages/
  api-contracts/
  auth/
  config/
  constants/
  env/
  errors/
  types/
  typescript-config/
  utils/
```
