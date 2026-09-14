import pool
  from "../config/db.js";

import {
  ORDER_STATUS
} from "../constants/orderStatus.js";

import {
  PAYMENT_STATUS
} from "../constants/paymentStatus.js";

import {
  REFUND_STATUS
} from "../constants/refundStatus.js";

import {
  releaseOrderStock
} from "./inventoryService.js";


export const processRefund = async (
  orderId,
  idempotencyKey,
  reason
) => {

  const client =
    await pool.connect();


  try {

    await client.query(
      "BEGIN"
    );


    // Lock order
    // 

    const orderResult =
      await client.query(
        `
        SELECT *
        FROM orders
        WHERE id = $1
        FOR UPDATE
        `,
        [orderId]
      );


    if (
      orderResult.rows.length === 0
    ) {

      throw new Error(
        "ORDER_NOT_FOUND"
      );
    }


    const order =
      orderResult.rows[0];


    // Refund only PAID orders

    if (
      order.status !==
      ORDER_STATUS.PAID
    ) {

      throw new Error(
        "ORDER_NOT_REFUNDABLE"
      );
    }


    // Get payment

    const paymentResult =
      await client.query(
        `
        SELECT *
        FROM payments
        WHERE order_id = $1
        FOR UPDATE
        `,
        [orderId]
      );


    if (
      paymentResult.rows.length === 0
    ) {

      throw new Error(
        "PAYMENT_NOT_FOUND"
      );
    }


    const payment =
      paymentResult.rows[0];


    if (
      payment.status !==
      PAYMENT_STATUS.SUCCESS
    ) {

      throw new Error(
        "PAYMENT_NOT_REFUNDABLE"
      );
    }


    // Duplicate refund protection
    const existingRefund =
      await client.query(
        `
        SELECT *
        FROM refunds
        WHERE order_id = $1
           OR idempotency_key = $2
        `,
        [
          orderId,
          idempotencyKey
        ]
      );


    if (
      existingRefund.rows.length > 0
    ) {

      throw new Error(
        "DUPLICATE_REFUND"
      );
    }


    // Create refund

    const refundResult =
      await client.query(
        `
        INSERT INTO refunds (
          order_id,
          payment_id,
          idempotency_key,
          amount,
          status,
          reason
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
        RETURNING *
        `,
        [
          orderId,
          payment.id,
          idempotencyKey,
          payment.amount,
          REFUND_STATUS.SUCCESS,
          reason || null,
        ]
      );


    // Restore inventory

    if (
      !order.stock_released
    ) {

      await releaseOrderStock(
        client,
        orderId
      );
    }

    // Payment -> REFUNDED

    await client.query(
      `
      UPDATE payments
      SET
        status = $1,
        updated_at = NOW()
      WHERE id = $2
      `,
      [
        PAYMENT_STATUS.REFUNDED,
        payment.id,
      ]
    );


    // Order -> CANCELLED

    await client.query(
      `
      UPDATE orders
      SET
        status = $1,
        stock_released = TRUE,
        updated_at = NOW()
      WHERE id = $2
      `,
      [
        ORDER_STATUS.CANCELLED,
        orderId,
      ]
    );


    await client.query(
      "COMMIT"
    );


    return refundResult.rows[0];


  } catch (error) {

    await client.query(
      "ROLLBACK"
    );

    throw error;


  } finally {

    client.release();
  }
};