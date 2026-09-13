import pool from "../config/db.js";

import {
  ORDER_STATUS
} from "../constants/orderStatus.js";

import {
  PAYMENT_STATUS
} from "../constants/paymentStatus.js";

import {
  releaseOrderStock
} from "./inventoryService.js";


export const processPayment = async (
  orderId,
  outcome,
  idempotencyKey
) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

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


    const duplicateKeyResult =
      await client.query(
        `
        SELECT id
        FROM payments
        WHERE idempotency_key = $1
        `,
        [idempotencyKey]
      );


    if (duplicateKeyResult.rows.length > 0) {
      throw new Error("DUPLICATE_PAYMENT");
    }


    const existingPaymentResult =
      await client.query(
        `
        SELECT id
        FROM payments
        WHERE order_id = $1
        `,
        [orderId]
      );


    if (existingPaymentResult.rows.length > 0) {
      throw new Error("DUPLICATE_PAYMENT");
    }


    if (order.status !== ORDER_STATUS.RESERVED) {
      throw new Error("ORDER_NOT_PAYABLE");
    }


  
    if (
      new Date(order.reservation_expires_at)
      <= new Date()
    ) {

      if (!order.stock_released) {

        await releaseOrderStock(
          client,
          orderId
        );
      }


      await client.query(
        `
        UPDATE orders
        SET
          status = $1,
          updated_at = NOW()
        WHERE id = $2
        `,
        [
          ORDER_STATUS.EXPIRED,
          orderId
        ]
      );


      await client.query("COMMIT");


      return {
        success: false,
        code: "RESERVATION_EXPIRED"
      };
    }



    if (outcome === "success") {

      const paymentResult =
        await client.query(
          `
          INSERT INTO payments (
            order_id,
            idempotency_key,
            amount,
            status
          )
          VALUES ($1, $2, $3, $4)
          RETURNING *
          `,
          [
            orderId,
            idempotencyKey,
            order.total_amount,
            PAYMENT_STATUS.SUCCESS
          ]
        );


      await client.query(
        `
        UPDATE orders
        SET
          status = $1,
          updated_at = NOW()
        WHERE id = $2
        `,
        [
          ORDER_STATUS.PAID,
          orderId
        ]
      );


      await client.query("COMMIT");


      return {
        success: true,
        payment: paymentResult.rows[0],
        orderStatus: ORDER_STATUS.PAID
      };
    }


    if (outcome === "failure") {

      const paymentResult =
        await client.query(
          `
          INSERT INTO payments (
            order_id,
            idempotency_key,
            amount,
            status
          )
          VALUES ($1, $2, $3, $4)
          RETURNING *
          `,
          [
            orderId,
            idempotencyKey,
            order.total_amount,
            PAYMENT_STATUS.FAILED
          ]
        );


      if (!order.stock_released) {

        await releaseOrderStock(
          client,
          orderId
        );
      }


      await client.query(
        `
        UPDATE orders
        SET
          status = $1,
          updated_at = NOW()
        WHERE id = $2
        `,
        [
          ORDER_STATUS.FAILED,
          orderId
        ]
      );


      await client.query("COMMIT");


      return {
        success: false,
        payment: paymentResult.rows[0],
        orderStatus: ORDER_STATUS.FAILED
      };
    }


    
    //  TIMEOUT

    if (outcome === "timeout") {

      const paymentResult =
        await client.query(
          `
          INSERT INTO payments (
            order_id,
            idempotency_key,
            amount,
            status
          )
          VALUES ($1, $2, $3, $4)
          RETURNING *
          `,
          [
            orderId,
            idempotencyKey,
            order.total_amount,
            PAYMENT_STATUS.TIMEOUT
          ]
        );


      if (!order.stock_released) {

        await releaseOrderStock(
          client,
          orderId
        );
      }


      await client.query(
        `
        UPDATE orders
        SET
          status = $1,
          updated_at = NOW()
        WHERE id = $2
        `,
        [
          ORDER_STATUS.EXPIRED,
          orderId
        ]
      );


      await client.query("COMMIT");


      return {
        success: false,
        payment: paymentResult.rows[0],
        orderStatus: ORDER_STATUS.EXPIRED
      };
    }


    throw new Error("INVALID_PAYMENT_OUTCOME");


  } catch (error) {

    await client.query("ROLLBACK");

    throw error;

  } finally {

    client.release();
  }
};