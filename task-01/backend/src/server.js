import "dotenv/config";

import app from "./app.js";
import pool from "./config/db.js";

import {
  checkExpiredReservations
} from "./jobs/expireReservations.js";


const PORT = process.env.PORT || 5000;


const startServer = async () => {

  try {

    await pool.query("SELECT NOW()");
    console.log("PostgreSQL DB connected");

    app.listen(PORT, () => {
      console.log( `Server running on http://localhost:${PORT}` );


      // Check once when server starts
      checkExpiredReservations();


      // Then check every 10 seconds
      setInterval(
        checkExpiredReservations,
        10 * 1000
      );

    });



    
  } catch (error) {

    console.error(
      "DB connection failed:",
      error
    );

    process.exit(1);
  }
};


startServer();