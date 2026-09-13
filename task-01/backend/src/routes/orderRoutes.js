import express from "express";

import {
  getOrders,
  getOrder,
  cancelOrder
} from "../controllers/orderController.js";


const router = express.Router();


router.get("/", getOrders);
router.get("/:id", getOrder);

router.post( "/:id/cancel", cancelOrder );


export default router;