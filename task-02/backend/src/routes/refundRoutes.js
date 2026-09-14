import express
  from "express";

import {
  refundOrder
} from "../controllers/refundController.js";


const router =
  express.Router();


router.post(
  "/:id/refund",
  refundOrder
);


export default router;