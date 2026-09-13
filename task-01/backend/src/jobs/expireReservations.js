import pool from "../config/db.js";

import {
  expireReservation
} from "../services/reservationService.js";


export const checkExpiredReservations = async () => {

  try {
    const result = await pool.query(
      ` SELECT id
      FROM orders
      WHERE
        status = 'RESERVED'
        AND stock_released = FALSE
        AND reservation_expires_at <= NOW()
      ORDER BY reservation_expires_at ASC
      `
    );


    if (result.rows.length === 0) {
      return;
    }


    console.log(
      `Found ${result.rows.length} expired reservation(s)`
    );


    for (const order of result.rows) {
      await expireReservation(order.id);

    }

  } catch (error) {
    console.error(
      "Reservation expiry job failed:",
      error
    );
  }
};