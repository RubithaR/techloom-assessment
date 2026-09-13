import pool from "../config/db.js";

import {
  ORDER_STATUS
} from "../constants/orderStatus.js";

import {
  releaseOrderStock
} from "./inventoryService.js";


export const getAllOrders = async () => {

  const result = await pool.query(`
    SELECT
      id,
      cart_id,
      status,
      total_amount,
      reservation_expires_at,
      stock_released,
      created_at,
      updated_at
    FROM orders
    ORDER BY created_at DESC
  `);

  return result.rows;
};


export const getOrderById = async (orderId) => {

  const orderResult = await pool.query(
    `
    SELECT *
    FROM orders
    WHERE id = $1
    `,
    [orderId]
  );

  if (orderResult.rows.length === 0) {
    return null;
  }


  const itemsResult = await pool.query(
    `
    SELECT
      product_id,
      product_name,
      quantity,
      unit_price,
      subtotal
    FROM order_items
    WHERE order_id = $1
    ORDER BY id
    `,
    [orderId]
  );


  const paymentResult = await pool.query(
    `
    SELECT
      id,
      amount,
      status,
      created_at
    FROM payments
    WHERE order_id = $1
    `,
    [orderId]
  );


  return {
    ...orderResult.rows[0],
    items: itemsResult.rows,
    payment:
      paymentResult.rows[0] || null
  };
};


export const cancelOrder = async (orderId) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");


    // 1. Lock order
    const orderResult = await client.query(
      `
      SELECT *
      FROM orders
      WHERE id = $1
      FOR UPDATE
      `,
      [orderId]
    );


    if (orderResult.rows.length === 0) {
      throw new Error("ORDER_NOT_FOUND");
    }


    const order = orderResult.rows[0];


    // 2. Prevent invalid transitions
    const cancellableStatuses = [
      ORDER_STATUS.RESERVED,
      ORDER_STATUS.PAID
    ];


    if (
      !cancellableStatuses.includes(
        order.status
      )
    ) {

      throw new Error(
        "ORDER_NOT_CANCELLABLE"
      );
    }


    // 3. Restore stock only once
    if (!order.stock_released) {

      await releaseOrderStock(
        client,
        orderId
      );
    }


    // 4. Change order status
    const updatedOrderResult =
      await client.query(
        `
        UPDATE orders
        SET
          status = $1,
          stock_released = TRUE,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
        `,
        [
          ORDER_STATUS.CANCELLED,
          orderId
        ]
      );


    await client.query("COMMIT");


    return updatedOrderResult.rows[0];


  } catch (error) {

    await client.query("ROLLBACK");

    throw error;

  } finally {

    client.release();
  }
};