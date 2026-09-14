# Task 02 - E-Commerce Store and Order Management

This task extends the first system into a small e-commerce application with product browsing, filtering, checkout, order history, refunds, and product administration.

## Live Links

Frontend: 
https://techloom-assessment-17iq.vercel.app/

Backend:
https://e-commercesystem-production.up.railway.app/

Example API:
https://e-commercesystem-production.up.railway.app/api/products

## Tech Stack

Frontend:
- React
- Vite
- React Router
- Axios

Backend:
- Node.js
- Express.js
- PostgreSQL
- pg

Database and Hosting:
- Supabase PostgreSQL
- Railway
- Vercel

## Main Features

### Product Store

Users can:
- View available products
- Search by product name or description
- Filter by category
- Filter by minimum and maximum price
- View product details
- Add products to the cart

### Cart and Checkout

Users can:
- Update cart quantities
- Remove items
- Checkout available products
- Reserve stock during checkout
- Complete a mock payment

Stock is validated inside a database transaction to prevent overselling.

### Order History

Users can:
- View previous orders
- View order items and payment details
- Cancel reserved orders
- Refund paid orders

### Refund Processing

Only paid orders can be refunded.

A successful refund:
- creates a refund record
- changes the payment status to `REFUNDED`
- changes the order status to `CANCELLED`
- restores the product stock

Duplicate refund requests are rejected using an idempotency key.

### Product Administration

The admin inventory page allows:
- Creating products
- Editing product information
- Updating available stock
- Removing products from the storefront

Products are soft deleted so historical order data is preserved.

## API Endpoints

### Products

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

Examples:

```text
GET /api/products?search=keyboard
GET /api/products?category=Accessories
GET /api/products?minPrice=5000&maxPrice=50000
```

### Cart and Checkout

```text
POST   /api/carts
GET    /api/carts/:id
POST   /api/carts/:id/items
PUT    /api/carts/:id/items/:productId
DELETE /api/carts/:id/items/:productId
POST   /api/carts/:id/checkout
```

### Orders, Payments and Refunds

```text
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders/:id/payment
POST   /api/orders/:id/cancel
POST   /api/orders/:id/refund
```

## Local Setup

### Backend

```bash
cd task-02/backend
npm install
```

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
FRONTEND_URL=http://localhost:5173
```

Run:

```bash
npm run dev
```

### Frontend

```bash
cd task-02/frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Run:

```bash
npm run dev
```

## Notes

PostgreSQL transactions and row locking are used for stock-sensitive operations. Payment, cancellation, reservation expiry, and refund flows are handled so inventory remains consistent.
