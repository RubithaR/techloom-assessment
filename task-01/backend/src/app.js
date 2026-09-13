import express from "express";
import cors from "cors";

import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173"
  })
);

app.use(express.json());



app.get("/", ( req, res) => {
  res.json({
    message: "APP is running",
  });
});


app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes );
app.use( "/api/orders", paymentRoutes);

app.use(notFound);
app.use(errorHandler);


export default app;