# Architecture

## System Overview

```text
React + TypeScript
        |
        | REST + JWT
        v
Express + TypeScript
        |
        | Routes -> Controllers -> Business Logic
        v
Prisma ORM
        |
        v
PostgreSQL
```

## Backend responsibilities

- **Routes** define the HTTP surface and attach middleware.
- **Controllers** translate HTTP requests into application operations and responses.
- **Validators** enforce request contracts at the API boundary.
- **Middleware** handles authentication, authorization, and centralized errors.
- **Utils** contain shared infrastructure such as the Prisma client.

## Core business flow: challan confirmation

```text
Draft Challan
     |
     v
Validate items and current stock
     |
     +---- insufficient ----> reject
     |
     v
Database transaction
     |
     +--> reduce inventory
     +--> create OUT stock movements
     +--> mark challan CONFIRMED
     |
     v
Atomic result
```

The transaction is important because confirmation changes multiple related records. A failure rolls back the complete operation rather than leaving inventory and challan state inconsistent.

## Data integrity decisions

- Draft challans do not reduce stock.
- Confirmed challans cannot be confirmed again.
- Stock cannot become negative.
- Challan items store product snapshots so historical documents remain stable when product details change.
- Inventory changes are recorded as stock movements.

## Frontend responsibilities

The React application is organized around pages, reusable UI components, API services, authentication context, and feature-specific behavior. API communication stays outside presentation components where practical, making screens easier to test and maintain.

## Security boundaries

- JWT is required for protected APIs.
- Role-based middleware controls privileged operations.
- Secrets and database credentials are supplied through environment variables.
- CORS is restricted to configured frontend origins and local development origins.

## Interview talking points

1. Why use Prisma instead of writing SQL throughout the application?
2. Why should challan confirmation be transactional?
3. Why keep product snapshots on challan items?
4. How does RBAC differ from authentication?
5. How do you prevent negative inventory?
6. Where would you place business logic if the application grows?
7. How would you add automated CI/CD and integration tests?
