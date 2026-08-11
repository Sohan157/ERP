# One-Day Execution Plan

## 08:00–09:00 — Foundation

- Create repository
- Start PostgreSQL
- Initialize backend
- Initialize frontend
- Add environment variables
- Add Prisma
- Health check
- First Git commit

## 09:00–10:00 — Database

- Finish Prisma schema
- Run migration
- Seed users
- Seed customers
- Seed products
- Verify with Prisma Studio

## 10:00–11:00 — Authentication

- Login
- bcrypt
- JWT
- Auth middleware
- Role middleware
- `/me`
- Postman test

## 11:00–12:30 — Customer CRM

- CRUD
- Search
- Pagination
- Detail
- Follow-up

## 12:30–14:00 — Products + Inventory

- Product CRUD
- Stock IN/OUT
- Movement log
- Low-stock indicator

## 14:00–16:00 — Challan

- Create draft
- Multiple items
- Snapshot fields
- Confirm
- Cancel
- Stock validation
- Prisma transaction
- OUT movement

## 16:00–17:30 — React UI

- Login
- Layout
- Dashboard
- Customers
- Products
- Inventory
- Challans

## 17:30–18:30 — Testing

Test:

1. Admin login
2. Sales login
3. Warehouse login
4. Accounts login
5. Customer creation
6. Product creation
7. Stock IN
8. Draft challan
9. Confirm challan
10. Insufficient stock
11. Cancel challan
12. Search/filter
13. Role restrictions

## 18:30–19:30 — Deployment

Recommended:

- Database: Neon / Supabase / Render PostgreSQL
- Backend: Render
- Frontend: Vercel

## 19:30–20:30 — Documentation

- README
- API docs
- Architecture
- Environment variables
- Deployment steps
- Assumptions
- Known limitations
- Postman collection

## 20:30–21:00 — Final demo

Show:

Login -> Dashboard -> Customer -> Product -> Inventory -> Challan Draft -> Confirm -> Stock Reduced -> Movement Log -> Insufficient Stock Error.

## Rule for the day

Do not add bonus features until all mandatory requirements work end-to-end.
