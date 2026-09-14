import express from "express";
import cors from "cors";

import productRoutes
  from "./routes/productRoutes.js";

import cartRoutes
  from "./routes/cartRoutes.js";

import orderRoutes
  from "./routes/orderRoutes.js";

import paymentRoutes
  from "./routes/paymentRoutes.js";

import refundRoutes
  from "./routes/refundRoutes.js";


const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
];


app.use(
  cors({
    origin: (origin, callback) => {

      // Allow Postman/server-to-server requests
      if (!origin) {
        return callback(
          null,
          true
        );
      }


      if (
        allowedOrigins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }


      console.log(
        "Blocked CORS origin:",
        origin
      );


      return callback(
        new Error(
          "Not allowed by CORS"
        )
      );
    },
  })
);


app.use(
  express.json()
);


app.get(
  "/",
  (req, res) => {

    res.json({
      message:
        "Task 02 API is running",
    });

  }
);


app.use(
  "/api/products",
  productRoutes
);


app.use(
  "/api/carts",
  cartRoutes
);


app.use(
  "/api/orders",
  orderRoutes
);


app.use(
  "/api/orders",
  paymentRoutes
);


app.use(
  "/api/orders",
  refundRoutes
);


export default app;