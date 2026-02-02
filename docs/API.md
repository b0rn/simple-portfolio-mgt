# API Documentation

> Complete API reference for the Simple Portfolio App. All backend implementations conform to the same [OpenAPI 3.1 specification](../backend/openapi.yaml).

**Interactive docs (Swagger UI):** [https://b0rn.github.io/simple-portfolio-mgt/api/](https://b0rn.github.io/simple-portfolio-mgt/api/)

---

## Base URL

| Environment | URL |
|-------------|-----|
| Production  | `https://spa.demos.vleveneur.com` |
| Local dev   | `http://localhost:8000` |

---

## Authentication

The API uses **JWT-based authentication** with HttpOnly cookies. After login or registration, the server sets an authentication cookie automatically. Subsequent requests are authenticated via this cookie.

> No `Authorization` header is required — the cookie is sent automatically by the browser.

### Authenticated Endpoints

All endpoints except `POST /auth/register`, `POST /auth/login`, and `GET /prices` require authentication.

---

## Endpoints

### Auth

#### `POST /auth/register`

Register a new user account.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

| Field      | Type   | Constraints                  |
|------------|--------|------------------------------|
| `email`    | string | Valid email format, required |
| `password` | string | 12–128 characters, required  |

**Response:** `201 Created`

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### `POST /auth/login`

Authenticate and receive a session cookie.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK` — same shape as register.

---

#### `POST /auth/logout`

Invalidate the current session.

**Response:** `200 OK`

---

#### `GET /auth/me`

Get the currently authenticated user.

**Response:** `200 OK`

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### Portfolios

#### `POST /portfolios`

Create a new portfolio.

**Request body:**

```json
{
  "name": "My Portfolio"
}
```

| Field  | Type   | Constraints              |
|--------|--------|--------------------------|
| `name` | string | 1–100 characters, required |

**Response:** `201 Created`

```json
{
  "id": 1,
  "owner_id": "uuid",
  "name": "My Portfolio",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### `GET /portfolios`

List all portfolios for the authenticated user.

**Query parameters:**

| Parameter       | Type    | Default | Constraints |
|-----------------|---------|---------|-------------|
| `page`          | integer | 1       | >= 1        |
| `items_per_page`| integer | 20      | 1–100       |

**Response:** `200 OK`

```json
{
  "items": [ /* PortfolioResponse[] */ ],
  "pagination_response": {
    "total_items": 5,
    "total_pages": 1,
    "current_page": 1,
    "items_per_page": 20
  }
}
```

---

#### `GET /portfolios/{portfolio_id}`

Get a single portfolio by ID.

**Response:** `200 OK` — `PortfolioResponse`

---

#### `PATCH /portfolios/{portfolio_id}`

Update a portfolio.

**Request body:**

```json
{
  "name": "Renamed Portfolio"
}
```

| Field  | Type           | Constraints        |
|--------|----------------|--------------------|
| `name` | string \| null | 1–100 chars if set |

**Response:** `200 OK` — `PortfolioResponse`

---

#### `DELETE /portfolios/{portfolio_id}`

Delete a portfolio and all its assets.

**Response:** `204 No Content`

---

#### `GET /portfolios/{portfolio_id}/valuation`

Get the current valuation of a portfolio (asset quantities multiplied by latest prices).

**Response:** `200 OK`

```json
{
  "portfolio_id": 1,
  "total_value": 15234.50,
  "lines": [
    {
      "symbol": "AAPL",
      "quantity": 10,
      "price": 185.50,
      "value": 1855.00
    }
  ],
  "unknown_symbols": ["INVALID"]
}
```

---

### Assets

#### `POST /portfolios/{portfolio_id}/assets`

Add an asset to a portfolio.

**Request body:**

```json
{
  "symbol": "AAPL",
  "quantity": 10
}
```

| Field      | Type   | Constraints                |
|------------|--------|----------------------------|
| `symbol`   | string | 1–16 characters, required  |
| `quantity`  | number | > 0, required              |

**Response:** `201 Created`

```json
{
  "id": 1,
  "portfolio_id": 1,
  "symbol": "AAPL",
  "quantity": 10,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### `GET /portfolios/{portfolio_id}/assets`

List assets in a portfolio (paginated).

**Query parameters:** same as `GET /portfolios` (`page`, `items_per_page`).

**Response:** `200 OK` — paginated `AssetResponse[]`

---

#### `DELETE /portfolios/{portfolio_id}/assets/{asset_id}`

Remove an asset from a portfolio.

**Response:** `204 No Content`

---

#### `GET /prices`

Get the latest known prices for all tracked symbols.

**Response:** `200 OK`

```json
{
  "AAPL": 185.50,
  "BTC": 43250.00
}
```

---

## Error Responses

### Validation Error — `422`

Returned when request body or parameters fail validation.

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Common HTTP Status Codes

| Code  | Meaning                |
|-------|------------------------|
| `200` | Success                |
| `201` | Created                |
| `204` | No Content (deleted)   |
| `401` | Unauthorized           |
| `403` | Forbidden              |
| `404` | Not Found              |
| `422` | Validation Error       |
| `500` | Internal Server Error  |

---

## Schemas Reference

Full schema definitions are available in the [OpenAPI spec](../backend/openapi.yaml). Key models:

| Schema                      | Description                              |
|-----------------------------|------------------------------------------|
| `RegisterRequest`           | Email + password for registration        |
| `LoginRequest`              | Email + password for login               |
| `MeResponse`                | Wrapper around `UserResponse`            |
| `UserResponse`              | User id, email, created_at               |
| `PortfolioCreateRequest`    | Portfolio name                           |
| `PortfolioPatchRequest`     | Optional portfolio name update           |
| `PortfolioResponse`         | Portfolio id, owner_id, name, created_at |
| `PortfolioValuationResponse`| Valuation with line items                |
| `AssetCreateRequest`        | Symbol + quantity                        |
| `AssetResponse`             | Asset id, portfolio_id, symbol, quantity, created_at |
| `PaginationResponse`        | total_items, total_pages, current_page, items_per_page |
