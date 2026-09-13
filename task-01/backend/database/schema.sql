-- product
CREATE TABLE products(
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL ,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    available_stock INTEGER NOT NULL DEFAULT 0 CHECK (available_stock >= 0),
    create_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP ,
    updated_at TIMESTAMPTZ DEFAULT now() 
);

CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    UNIQUE(cart_id, product_id)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL UNIQUE REFERENCES carts(id),
    status VARCHAR(30) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    reservation_expires_at TIMESTAMP,
    stock_released BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULLREFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    product_name VARCHAR(150) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);