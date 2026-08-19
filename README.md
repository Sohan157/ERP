# Mini ERP + CRM Operations Platform

A full-stack wholesale and distribution ERP/CRM application built with **React, TypeScript, Express, Prisma and PostgreSQL**.

The project demonstrates production-oriented application design: JWT authentication, role-based access control, CRM workflows, inventory integrity, transaction-safe challan confirmation, REST APIs, validation, pagination and a responsive admin interface.

## Why this project is interview-ready

- **Authentication:** JWT-based login and protected APIs
- **Authorization:** Admin, Sales, Warehouse and Accounts roles
- **CRM:** customers, search, details and follow-up notes
- **Products:** CRUD, search, categories and SKU validation
- **Inventory:** stock IN/OUT and movement history
- **Sales challans:** draft, confirmed and cancelled lifecycle
- **Data integrity:** stock validation and no-negative-stock rules
- **Transactions:** atomic inventory updates during challan confirmation
- **Historical accuracy:** product snapshots are stored on challan items
- **API quality:** validation, HTTP errors, filtering and pagination
- **Deployment:** environment-based configuration and deployment documentation

## Architecture

```text
React + TypeScript
        |
        | REST + JWT
        v
Express + TypeScript
        |
        | Prisma ORM
        v
PostgreSQL
```

Detailed design decisions are documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Repository structure

```text
ERP/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── utils/
│       ├── validators/
│       ├── app.ts
│       └── server.ts
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── App.tsx
│       └── main.tsx
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   └── ONE_DAY_PLAN.md
├── postman/
├── compose.yml
└── README.md
```

## Core business flow: challan confirmation

Creating a draft challan does **not** change inventory.

When a challan is confirmed:

1. Load the challan items.
2. Validate current stock for every item.
3. Reject the operation if any item has insufficient stock.
4. Execute the stock changes inside a database transaction.
5. Reduce inventory quantities.
6. Create an `OUT` stock movement for every item.
7. Mark the challan as `CONFIRMED`.

This prevents negative inventory and avoids partial updates.

### Product snapshots

Challan items retain the product ID, name, SKU, unit price and quantity at the time of the transaction. This keeps historical challans accurate even if the product is edited later.

## API surface

```text
POST /api/auth/login
GET  /api/auth/me

GET    /api/customers
GET    /api/customers/:id
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id
POST   /api/customers/:id/followups

GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id

GET    /api/inventory
POST   /api/inventory/:productId/stock
GET    /api/inventory/movements

GET    /api/challans
GET    /api/challans/:id
POST   /api/challans
POST   /api/challans/:id/confirm
POST   /api/challans/:id/cancel

GET    /api/dashboard
```

See [`docs/API.md`](docs/API.md) and the Postman collection for request details.

## Local setup

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL 15+ or Podman/Docker
- Git

### 1. Start PostgreSQL

```bash
podman compose up -d postgres
```

Or use a local PostgreSQL installation and configure `DATABASE_URL`.

### 2. Backend

```bash
cd backend
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Linux/macOS:

```bash
cp .env.example .env
```

API: `http://localhost:5000`

Health check: `http://localhost:5000/api/health`

### 3. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Linux/macOS:

```bash
cp .env.example .env
```

Frontend: `http://localhost:5173`

## Seed credentials

All seeded users use:

```text
Password: Password123!
```

| Role | Email |
|---|---|
| Admin | admin@example.com |
| Sales | sales@example.com |
| Warehouse | warehouse@example.com |
| Accounts | accounts@example.com |

These credentials are for local/demo use only. Change them before any real deployment.

## Environment variables

Backend:

```env
DATABASE_URL=postgresql://erp_user:erp_password@localhost:5432/mini_erp?schema=public
JWT_SECRET=replace-this-with-a-long-random-secret
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit real `.env` files or production secrets.

## Testing checklist

### Authentication

- [ ] Valid login returns JWT
- [ ] Invalid password returns 401
- [ ] Missing token returns 401
- [ ] Role restrictions work

### Customers

- [ ] Create and edit
- [ ] Search and pagination
- [ ] Detail view
- [ ] Follow-up creation

### Products

- [ ] Create and edit
- [ ] Search
- [ ] Duplicate SKU rejected

### Inventory

- [ ] Stock IN/OUT
- [ ] Movement log
- [ ] Low-stock indicator
- [ ] No negative stock

### Challans

- [ ] Draft creation does not reduce stock
- [ ] Confirmation reduces stock
- [ ] Insufficient stock is rejected
- [ ] Failed confirmation leaves stock unchanged
- [ ] Product snapshot is stored
- [ ] Cancelled challan cannot be confirmed

## Deployment

Recommended deployment architecture:

```text
Frontend  -> Vercel
Backend   -> Render
Database  -> Neon / Render PostgreSQL / Supabase
```

For backend deployment, configure `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` and `PORT`, then run Prisma migrations before starting the server.

For frontend deployment, configure `VITE_API_URL` to point to the deployed backend.

## Engineering roadmap

The current project intentionally focuses on the core ERP/CRM workflow. Future production hardening can include:

- Automated unit/integration tests
- CI/CD with GitHub Actions
- Refresh-token or HTTP-only cookie authentication
- Rate limiting
- Audit logging
- PDF challan/invoice export
- Advanced analytics
- Monitoring and observability

## Interview discussion points

**Q: Why use a database transaction for challan confirmation?**

Because confirmation changes several related records. A transaction ensures the inventory reductions, stock movements and challan status update either all succeed or all roll back.

**Q: How do you prevent negative stock?**

The confirmation flow validates the available quantity before applying the stock reduction and rejects the entire operation when any item is insufficient.

**Q: Why store product snapshots?**

Historical documents should not change when a product's current name, SKU or price changes. The snapshot preserves the values used at transaction time.
