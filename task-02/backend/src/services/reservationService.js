import pool from "../config/db.js";

export const expireReservation = async (orderId) => {

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    //  Lock the order
    const orderResult = await client.query(
      `SELECT * FROM orders
      WHERE id = $1
      FOR UPDATE      `,
      [orderId]
    );


    if (orderResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return false;
    }


    const order = orderResult.rows[0];


    //  Check whether it still needs expiry
    if ( order.status !== "RESERVED" || order.stock_released === true ||
      new Date(order.reservation_expires_at) > new Date() ) {

      await client.query("ROLLBACK");
      return false;
    }


    //  Get the reserved items
    const itemsResult = await client.query(
      `SELECT product_id, quantity
      FROM order_items
      WHERE order_id = $1
      ORDER BY product_id   `,
      [orderId]
    );


    //  Restore stock
    for (const item of itemsResult.rows) {
      await client.query(
        ` UPDATE products
        SET
          available_stock =
            available_stock + $1,
          updated_at = NOW()
        WHERE id = $2
        `,
        [
          item.quantity,
          item.product_id
        ]
      );
    }

// Mark order expired
    await client.query(
      ` UPDATE orders
      SET
        status = 'EXPIRED',
        stock_released = TRUE,
        updated_at = NOW()
      WHERE id = $1      `,
      [orderId]
    );


    await client.query("COMMIT");

    console.log(
      `Reservation expired for order ${orderId}`
    );

    return true;


  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      `Failed to expire order ${orderId}:`,
      error
    );

    throw error;

  } finally { client.release(); }
};