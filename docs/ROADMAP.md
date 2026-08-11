# Project Roadmap

## Phase 0 — Scope freeze

### Goal
Build only the mandatory ERP/CRM flow in one day.

### Must have
- Auth + roles
- Customers
- Products
- Inventory
- Stock movements
- Challans
- Stock validation
- React UI
- REST API
- PostgreSQL
- README
- Postman
- Deployment

### Defer
- PDF
- S3
- GitHub Actions
- AWS infrastructure
- Notifications
- Advanced reporting

---

## Phase 1 — Foundation

Tasks:
- [ ] Create repository
- [ ] Create backend
- [ ] Create frontend
- [ ] Create PostgreSQL
- [ ] Add environment variables
- [ ] Add Prisma
- [ ] Add CORS
- [ ] Add health endpoint
- [ ] First Git commit

Definition of done:
- Backend starts
- Frontend starts
- PostgreSQL is reachable

---

## Phase 2 — Database

Entities:
- User
- Customer
- FollowUp
- Product
- StockMovement
- Challan
- ChallanItem

Tasks:
- [ ] Prisma schema
- [ ] Migration
- [ ] Seed users
- [ ] Seed customers
- [ ] Seed products

Definition of done:
- `npx prisma migrate dev` works
- `npm run seed` works

---

## Phase 3 — Authentication

Tasks:
- [ ] Login API
- [ ] Password hashing
- [ ] JWT
- [ ] Auth middleware
- [ ] Role middleware
- [ ] `/auth/me`

Definition of done:
- All four test users can login
- Unauthorized calls fail
- Role-restricted calls fail correctly

---

## Phase 4 — CRM

Tasks:
- [ ] Customer create
- [ ] Customer edit
- [ ] Customer list
- [ ] Search
- [ ] Pagination
- [ ] Customer detail
- [ ] Follow-up notes

Definition of done:
- Sales can manage customers
- Admin can manage customers
- Follow-up is persisted

---

## Phase 5 — Products + Inventory

Tasks:
- [ ] Product create
- [ ] Product edit
- [ ] SKU uniqueness
- [ ] Stock IN
- [ ] Stock OUT
- [ ] Stock movement
- [ ] Low-stock calculation

Definition of done:
- Stock changes are transactional
- Stock never goes below zero

---

## Phase 6 — Challans

Tasks:
- [ ] Select customer
- [ ] Add multiple products
- [ ] Quantity
- [ ] Automatic challan number
- [ ] Draft
- [ ] Confirm
- [ ] Cancel
- [ ] Product snapshot
- [ ] Stock check
- [ ] Stock reduction
- [ ] OUT movement

Definition of done:
- Draft does not change stock
- Confirm changes stock
- Insufficient stock fails cleanly
- No partial stock update occurs

---

## Phase 7 — Dashboard/UI

Tasks:
- [ ] Sidebar
- [ ] Dashboard cards
- [ ] Recent challans
- [ ] Status badges
- [ ] Loading/error states
- [ ] Responsive layout
- [ ] Role-based navigation

---

## Phase 8 — Quality

Tasks:
- [ ] Test all API endpoints
- [ ] Test invalid input
- [ ] Test role permissions
- [ ] Test stock edge cases
- [ ] Test draft/confirm/cancel
- [ ] Test product snapshot
- [ ] Test mobile layout
- [ ] Postman collection

---

## Phase 9 — Deployment

Tasks:
- [ ] Create PostgreSQL cloud database
- [ ] Deploy backend
- [ ] Set backend env vars
- [ ] Deploy frontend
- [ ] Set VITE_API_URL
- [ ] Run Prisma migrations
- [ ] Seed or create test users
- [ ] Test live flow

---

## Phase 10 — Submission

- [ ] GitHub URL
- [ ] Frontend URL
- [ ] Backend URL
- [ ] Four test credentials
- [ ] Postman collection
- [ ] README
- [ ] Architecture
- [ ] Assumptions
- [ ] Known limitations
- [ ] Optional demo recording
