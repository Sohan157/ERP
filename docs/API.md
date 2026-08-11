# API Documentation

Base URL:

```text
http://localhost:5000/api
```

## Authentication

### POST /auth/login

```json
{
  "email": "admin@example.com",
  "password": "Password123!"
}
```

Returns JWT and user.

### GET /auth/me

Requires:

```text
Authorization: Bearer TOKEN
```

---

# Customers

## GET /customers

Query:

```text
?page=1&limit=10&search=abc&status=ACTIVE
```

## GET /customers/:id

Returns customer and follow-ups.

## POST /customers

```json
{
  "name": "Rahul Sharma",
  "mobile": "9876543210",
  "email": "rahul@example.com",
  "businessName": "ABC Traders",
  "gstNumber": "29ABCDE1234F1Z5",
  "type": "WHOLESALE",
  "address": "Bengaluru",
  "status": "ACTIVE",
  "notes": "Important customer"
}
```

## PUT /customers/:id

Same fields, all optional.

## DELETE /customers/:id

Admin only.

## POST /customers/:id/followups

```json
{
  "note": "Call regarding next order",
  "followUpDate": "2026-08-15"
}
```

---

# Products

## GET /products

Query:

```text
?page=1&limit=20&search=monitor
```

## GET /products/:id

## POST /products

```json
{
  "name": "27-inch Monitor",
  "sku": "MON-001",
  "category": "Monitors",
  "unitPrice": 12500,
  "currentStock": 25,
  "minStock": 5,
  "warehouseLocation": "A-01"
}
```

## PUT /products/:id

---

# Inventory

## GET /inventory

Returns products with `lowStock`.

## GET /inventory/movements

Returns stock movement history.

## POST /inventory/:productId/stock

```json
{
  "quantity": 10,
  "type": "IN",
  "reason": "Purchase received"
}
```

For OUT:

```json
{
  "quantity": 3,
  "type": "OUT",
  "reason": "Manual adjustment"
}
```

OUT is rejected when available stock is insufficient.

---

# Challans

## GET /challans

## GET /challans/:id

## POST /challans

Creates a DRAFT.

```json
{
  "customerId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 3
    }
  ]
}
```

## POST /challans/:id/confirm

Critical business operation:

- only DRAFT allowed
- validates all stock first
- transaction
- reduces stock
- creates OUT movements
- sets status CONFIRMED

## POST /challans/:id/cancel

Only DRAFT challans can be cancelled.

---

# Dashboard

## GET /dashboard

Returns:

- customer count
- product count
- low-stock count
- challan count
- recent challans
