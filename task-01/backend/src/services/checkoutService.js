import pool from "../config/db.js";
import { ORDER_STATUS } from "../constants/orderStatus.js";

export const checkoutCart = async (cartId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the cart
    const cartResult = await client.query(
      ` SELECT * FROM carts WHERE id = $1 FOR UPDATE`,
      [cartId]
    );

    if (cartResult.rows.length === 0) {
      throw new Error("Cart_not_found");
    }

    const cart = cartResult.rows[0];

    if (cart.status !== "ACTIVE") {
      throw new Error("Cart_not_Active");
    }


//  Check duplicate checkout

    const existingOrderResult = await client.query(
      ` SELECT id FROM orders WHERE cart_id = $1 `,
      [cartId]
    );

    if (existingOrderResult.rows.length > 0) {
      throw new Error("Order_already_exists");
    }


// Get cart items
    const cartItemsResult = await client.query(
      ` SELECT product_id, quantity FROM cart_items
      WHERE cart_id = $1
      ORDER BY product_id  `,
      [cartId]
    );

    const cartItems = cartItemsResult.rows;

    if (cartItems.length === 0) {
      throw new Error("Cart_empty");
    }


    // Get product IDs
    const productIds = cartItems.map(
      (item) => item.product_id
    );


    // Lock product row
    const productsResult = await client.query(
      ` SELECT id, name, price, available_stock
      FROM products
      WHERE id = ANY($1::int[])
      ORDER BY id
      FOR UPDATE   `,
      [productIds]
    );

    const products = productsResult.rows;


 // Validate all products exist
    if (products.length !== cartItems.length) {
      throw new Error("Product_not_found");
    }


    // Validate stock + calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      const product = products.find(
        (p) => p.id === cartItem.product_id
      );

      if (!product) {
        throw new Error("Product not found");
      }

// prevents overselling.
      if ( product.available_stock < cartItem.quantity ) {
        const error = new Error( "Insufficient_stock" );
        error.productName = product.name;
        error.availableStock = product.available_stock;
        throw error;
      }

      const unitPrice = Number(product.price);
      const quantity = Number(cartItem.quantity);
      const subtotal =  unitPrice * quantity;
      totalAmount += subtotal;


      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity, unitPrice, subtotal,
      });
    }


    //  Reserve stock
    for (const item of orderItems) {
      await client.query(
        ` UPDATE products
        SET
          available_stock =
            available_stock - $1,
          updated_at = NOW()
        WHERE id = $2
        `,
        [ item.quantity, item.productId ]
      );
    }


    //  Create order
    // reservation expires in 5 minutes

    const orderResult = await client.query(
      ` INSERT INTO orders ( cart_id, status, total_amount, reservation_expires_at, stock_released )
      VALUES ( $1, $2, $3, NOW() + INTERVAL '5 minutes', FALSE )
      RETURNING * `,
      [ cartId, ORDER_STATUS.RESERVED,  totalAmount, ]
    );

    const order = orderResult.rows[0];

    for (const item of orderItems) {
      await client.query(
        ` INSERT INTO order_items ( order_id, product_id, product_name, quantity, unit_price, subtotal )
        VALUES ( $1, $2, $3, $4,$5,$6)         `,
        [ order.id, item.productId,
          item.productName,item.quantity,
          item.unitPrice,item.subtotal   ]
      );
    }


    // Mark cart as checked out
    await client.query(
      ` UPDATE carts
      SET
        status = 'CHECKED_OUT',
        updated_at = NOW()
      WHERE id = $1              `,
      [cartId]
    );




    //  Commit /rollback

    await client.query("COMMIT");
    return {
      ...order,
      items: orderItems,
    };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;


  } finally { client.release(); }
};