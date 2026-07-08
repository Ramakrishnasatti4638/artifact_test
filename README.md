# Product Catalog REST API

A lightweight Express/Node.js REST API for managing a product catalog, with an in-memory data store and a full Jest + supertest integration-test suite.

## Getting Started

```bash
npm install
npm start          # http://localhost:3000
npm test           # run all 28 integration tests
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check – returns `{ status, uptime }` |
| `POST` | `/api/products` | Create a product (201 / 400) |
| `GET` | `/api/products` | List products (supports `?category=` & `?inStock=true`) |
| `GET` | `/api/products/:id` | Get one product (404 if missing) |
| `PUT` | `/api/products/:id` | Partial update (404 if missing, 400 on bad values) |
| `DELETE` | `/api/products/:id` | Delete a product (204 / 404) |

## Product Schema

```json
{
  "id":          "uuid",
  "name":        "string  (required)",
  "description": "string",
  "price":       "number  (> 0, required)",
  "category":    "string",
  "stock":       "integer (>= 0, required)",
  "createdAt":   "ISO 8601",
  "updatedAt":   "ISO 8601"
}
```

## Project Structure

```
├── index.js            # Entry point – starts the HTTP server
├── src/
│   ├── app.js          # Express app (routes wired up, health endpoint)
│   ├── routes.js       # /api/products route handlers
│   └── products.js     # In-memory store + validation helpers
└── tests/
    └── products.test.js  # 28 Jest + supertest integration tests
```
