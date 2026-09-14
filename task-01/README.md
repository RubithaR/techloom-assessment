# Task 01 - POS Order and Inventory System

This task implements a POS-style order and inventory system with stock reservation, concurrency protection, mock payments, order lifecycle handling, and a small inventory management interface.

## Live Links

Frontend:
https://techloom-assessment-six.vercel.app

Backend:
https://techloom-assessment-production-1611.up.railway.app

Example API:
https://techloom-assessment-production-1611.up.railway.app/api/products

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
- Railway for backend deployment
- Vercel for frontend deployment

## Main Features

### Product and Inventory Management

The inventory page allows an admin style user to:
- View all products
- Create products
- Update product details
- Delete unused products
- View the current available stock for every product

Products already referenced by carts or orders are protected by database foreign keys so historical data is not removed accidentally.

### Customer POS Flow

A user can:
- View available products
- Add products to a cart
- Update cart quantities
- Remove cart items
- Proceed to checkout
- Complete a mock payment
- View order history
- Cancel valid orders

### Stock Reservation

Stock is not reduced when an item is only added to the cart.

Stock is reserved when checkout starts.

The reservation:
- lasts for 5 minutes
- reduces available stock during checkout
- is released automatically if it expires
- is restored on failed payment
- is restored on valid cancellation

### Mock Payment

The mock payment flow supports:
- Success
- Failure
- Timeout

Success marks the order as paid.

Failure releases reserved stock and marks the order as failed.

Timeout expires the reservation and restores the stock.

Duplicate payment submissions are rejected.

### Order Lifecycle

The system uses clear order states such as:

```text
RESERVED
PAID
FAILED
EXPIRED
CANCELLED
```

Invalid transitions are rejected.

### Concurrency Protection

Checkout uses PostgreSQL transactions and row locking with:

```sql
SELECT ... FOR UPDATE
```

This prevents two users from purchasing the same final stock item at the same time.

A concurrency test is included to verify that:
- only one simultaneous checkout succeeds
- the other request is rejected
- stock never becomes negative

## API Endpoints

### Products

```text
POST   /api/products
GET    /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
```

### Cart

```text
POST   /api/carts
GET    /api/carts/:id
POST   /api/carts/:id/items
PUT    /api/carts/:id/items/:productId
DELETE /api/carts/:id/items/:productId
POST   /api/carts/:id/checkout
```

### Orders and Payments

```text
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders/:id/payment
POST   /api/orders/:id/cancel
```

## Local Setup

### Backend

```bash
cd task-01/backend
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

Backend:

```text
http://localhost:5000
```

### Frontend

```bash
cd task-01/frontend
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

Frontend:

```text
http://localhost:5173
```

## Concurrency Test

From the backend folder:

```bash
npm run test:concurrency
```

The expected result is one successful checkout, one rejected checkout, and final stock of zero.

## Notes

Environment files are not committed to the repository.

The system uses PostgreSQL transactions for checkout, payment-related stock handling, reservation expiry, and cancellation to avoid inconsistent inventory or order state.
