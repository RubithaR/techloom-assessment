-- product
CREATE TABLE products(
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL ,
    description TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    available_stock INTEGER NOT NULL DEFAULT 0 CHECK (available_stock >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    create_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP ,
    updated_at TIMESTAMPTZ DEFAULT now() 
);

CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
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
    reservation_expires_at TIMESTAMPTZ,
    stock_released BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
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
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE refunds (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL UNIQUE REFERENCES orders(id)
    payment_id INTEGER
        NOT NULL
        REFERENCES payments(id),
    idempotency_key VARCHAR(255)
        UNIQUE
        NOT NULL,
    amount NUMERIC(10,2)
        NOT NULL
        CHECK (amount >= 0),

    status VARCHAR(30)
        NOT NULL,

    reason TEXT,

    created_at TIMESTAMPTZ
        DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_name
ON products(name);

CREATE INDEX idx_products_category
ON products(category);

CREATE INDEX idx_products_price
ON products(price);

CREATE INDEX idx_products_active
ON products(is_active);

CREATE INDEX idx_orders_status
ON orders(status);

CREATE INDEX idx_orders_created_at
ON orders(created_at DESC);