import pool from "../config/db.js";

export const createCart = async () => {
  const result = await pool.query(`
    INSERT INTO carts (status)
    VALUES ('ACTIVE')
    RETURNING *
  `);

  return result.rows[0];
};

export const getCartById = async(cartId)=>{
    const cartResult  = await pool.query(`SELECT * FROM carts WHERE id = $1`,
        [cartId]
    );
    if (cartResult.rows.length === 0) {

        return null;
    }

    const itemsResult = await pool.query(
    ` SELECT ci.product_id, p.name, p.price, p.available_stock, ci.quantity,
      (p.price * ci.quantity) AS subtotal
    FROM cart_items ci
    JOIN products p
      ON p.id = ci.product_id
    WHERE ci.cart_id = $1
    ORDER BY ci.id
    `,
    [cartId]
    );

    const total = itemsResult.rows.reduce(
        (sum, item) => sum + Number(item.subtotal), 0 );

  return {
    ...cartResult .rows[0],
    items: itemsResult.rows,
    total
  };
};

export const addItemToCart = async (cartId, productId, quantity) => {
    const cartResult  = await pool.query(
        `SELECT * FROM carts WHERE id = $1`,
        [cartId]
    );

    if(cartResult.rows.length === 0) {  
        throw new Error("Cart_not_found");
    }

    if(cartResult.rows[0].status !== "ACTIVE") {
        throw new Error("Cart_not_Active");

    }

    const productResult = await pool.query(
        `SELECT * FROM products WHERE id = $1`,
        [productId]
    );

    if(productResult.rows.length === 0) {
        throw new Error("Product_not_found");
      }

    const result = await pool.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity)
        VALUES ($1, $2, $3) 
        ON CONFLICT (cart_id, product_id)
        DO UPDATE SET 
            quantity = cart_items.quantity + EXCLUDED.quantity
            RETURNING * `,
        [cartId, productId, quantity]
    );

    return result.rows[0];
};

export const updateCartItem = async (cartId, productId, quantity) => {
    const cartResult  = await pool.query(
        `UPDATE cart_items 
        SET quantity = $1
        WHERE cart_id = $2 AND product_id = $3
        RETURNING *`,
        [quantity, cartId, productId]
    );
    return cartResult.rows[0];
};

export const removeCartItem = async (cartId, productId) => {
    const result = await pool.query(
        `DELETE FROM cart_items
        WHERE cart_id = $1 AND product_id = $2
        RETURNING *`,
        [cartId, productId]
    );
    return result.rows[0];
}  ; 