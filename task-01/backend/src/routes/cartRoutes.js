import express from "express";

import {
  createCart,
  getCart,
  addItem,
  updateItem,
  removeItem

} from "../controllers/cartController.js";


import {
  checkout
} from "../controllers/checkoutController.js";


const router = express.Router();

router.post("/", createCart);
router.get("/:id", getCart);

router.post("/:id/items", addItem);

router.put("/:id/items/:productId", updateItem );

router.delete( "/:id/items/:productId", removeItem);

router.post( "/:id/checkout", checkout  );


export default router;