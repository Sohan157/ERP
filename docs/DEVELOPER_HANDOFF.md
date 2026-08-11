# Senior Developer Handoff

## Engineering decisions

### Why Express?
The assignment permits Express or NestJS. Express is chosen because it minimizes setup time for a one-day case study while still demonstrating REST architecture, middleware, validation and error handling.

### Why Prisma?
Prisma is used as the PostgreSQL ORM. It gives typed database access, migrations and transactions, which are useful for the stock/challan business rules.

### Why React + Vite?
Fast setup and build for a responsive SPA.

### Why PostgreSQL?
The case study explicitly permits PostgreSQL and the data model is relational.

### Why Podman?
The repository includes a Compose-compatible PostgreSQL service so local setup is reproducible without installing PostgreSQL directly.

## Business invariants

1. Stock can never become negative.
2. Draft challans do not affect stock.
3. Confirming a challan requires sufficient stock for every item.
4. Challan confirmation is transactional.
5. A confirmed/cancelled challan cannot be confirmed again.
6. Product information is snapshotted into ChallanItem.
7. Stock OUT operations also validate available stock.
8. Challan numbers are generated automatically.

## Suggested Git commits

```text
chore: initialize monorepo
feat: add postgres prisma schema and seed
feat: implement jwt authentication and roles
feat: add customer crm module
feat: add product inventory and stock movements
feat: add transactional sales challans
feat: add react admin dashboard
feat: add postman collection and api docs
docs: add deployment and submission guide
```

## Interview explanation

The strongest part of the solution is not the CRUD. It is the transactional sales-challan workflow:

```text
Draft
 -> Validate all stock
 -> Transaction
 -> Reduce all stocks
 -> Create OUT movements
 -> Confirm
```

If any validation fails, the transaction aborts and the database stays unchanged.
