4 Mini ERP + CRM Operations Portal

A full-stack Mini ERP + CRM Operations Portal built for the provided Full Stack Developer Case Study.

## 1. What this project covers

Mandatory case-study modules:

- JWT authentication
- Role-based access: Admin, Sales, Warehouse, Accounts
- Customer CRM
- Customer search, detail view and follow-up notes
- Product management
- Inventory and stock movement log
- Sales challans
- Draft / Confirmed / Cancelled challans
- Automatic challan numbering
- Multiple products per challan
- Product snapshot data inside challan items
- Stock validation
- No negative stock
- Transaction-safe stock reduction
- REST APIs
- Validation and HTTP error handling
- Search, filtering and pagination
- Responsive React admin UI
- Environment variables
- PostgreSQL
- Prisma ORM
- Postman collection
- Local Podman/Docker-compatible database setup
- Deployment documentation

A\S is intentionally not required for the one-day MVP; the case study says AWS is optional and free hosting is acceptable.

## 2. Architecture

```text
React + TypeScript
        |
        | REST + JWT
        v
Express + TypeScript
        |
        | Prisma
        v
PostgreSQL
```

## 3. Repository structure

```text
mini-erp-crm/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── postman/
│   └── Mini-ERP.postman_collection.json
├── docs/
│   ├── API.md
│   ├── ROADMAP.md
│   └── ONE_DAY_PLAN.md
├── compose.yml
├── .gitignore
└── README.md
```

## 4. Prerequisites

- Node.js 20+
- npm
- PostgreSQL 15+ OR Podman/Docker
- Git

## 5. Fast local setup

### A. Start PostgreSQL with Podman

```bash
podman compose up -d postgres
```

If your Podman installation uses `podman-compose`, use:

```bash
podman-compose up -d postgres
```

Or run PostgreSQL locally and use the DATABASE_URL from `.env`.

### B. Backend

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

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### C. Frontend

Open another terminal:

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

Frontend:

```text
http://localhost:5173
```

## 6. Seed credentials

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

Change these credentials before any real deployment.

## 7. Important business flow

### Draft

Creating a draft challan does NOT change stock.

### Confirm

Confirming a challan:

1. Loads all challan items.
2. Checks current stock.
3. Rejects the operation if any item is insufficient.
4. Uses a database transaction.
5. Reduces stock.
6. Creates an OUT stock movement for each item.
7. Changes challan status to CONFIRMED.

This prevents negative stock and prevents partial updates.

### Snapshot

Challan items save:

- product ID
- product name
- SKU
- unit price
- quantity

Therefore, old challans remain historically accurate if the product changes later.

## 8. API

See `docs/API.md` and the Postman collection.

Main endpoints:

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

## 9. Environment variables

### Backend

```env
DATABASE_URL=postgresql://erp_user:erp_password@localhost:5432/mini_erp?schema=public
JWT_SECRET=replace-this-with-a-long-random-secret
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Frontend

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit real `.env` files.

## 10. Testing checklist

### Authentication

- [ ] Valid login returns JWT
- [ ] Invalid password returns 401
- [ ] Missing token returns 401
- [ ] Role restrictions work

### Customers

- [ ] Create
- [ ] Edit
- [ ] Search
- [ ] Pagination
- [ ] Detail
- [ ] Follow-up

### Products

- [ ] Create
- [ ] Edit
- [ ] Search
- [ ] Duplicate SKU rejected

### Inventory

- [ ] Stock IN
- [ ] Stock OUT
- [ ] Movement log
- [ ] Low-stock indicator
- [ ] No negative stock

### Challans

- [ ] Create draft
- [ ] Draft does not reduce stock
- [ ] Confirm reduces stock
- [ ] Insufficient stock returns error
- [ ] Failed confirmation leaves stock unchanged
- [ ] Product snapshot is saved
- [ ] Cancelled challan cannot be confirmed

## 11. Deployment

Recommended one-day deployment:

```text
Frontend  -> Vercel
Backend   -> Render
Database  -> Neon / Render PostgreSQL / Supabase
```

### Backend deployment

Set:

```text
DATABASE_URL
JWT_SECRET
FRONTEND_URL
PORT
```

Build:

```bash
npm run build
```

Start:

```bash
npm start
```

Before starting the server on the platform:

```bash
npx prisma migrate deploy
```

### Frontend deployment

Set:

```text
VITE_API_URL=https://YOUR-BACKEND/api
```

Build:

```bash
npm run build
```

Publish the generated `dist` folder using the platform's standard Vite settings.

## 12. Production hardening after the case study

Not required for the one-day submission:

- Refresh tokens
- HTTP-only cookie auth
- Rate limiting
- Audit logging
- Automated tests
- CI/CD
- Docker image publishing
- S3
- PDF invoice/challan export
- Advanced analytics
- AWS infrastructure
- Monitoring and observability

## 13. Known MVP limitations

- Authentication is intentionally simple JWT auth for the assignment.
- No password reset flow.
- No email/SMS notifications.
- No invoice/PDF module because it is a bonus.
- No S3 product image upload because it is a bonus.
- No GitHub Actions because it is a bonus.
- Dashboard metrics are intentionally lightweight.
