import {
  processRefund
} from "../services/refundService.js";


export const refundOrder =async (req, res) => {

    try {

      const { id } = req.params;

      const { idempotencyKey, reason,  } = req.body;


      if (!idempotencyKey) {

        return res
          .status(400)
          .json({
            success: false,
            message:  "idempotencyKey is required",

          });
      }


      const refund =
        await processRefund(
          id,
          idempotencyKey,
          reason
        );


      return res
        .status(200)
        .json({
          success: true,
          message: "Refund processed successfully",
          data: refund,
        });


    } catch (error) {

      if (error.message === "ORDER_NOT_FOUND" ) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Order not found",

          });
      }


      if (error.message ==="ORDER_NOT_REFUNDABLE"  ) {
        return res
          .status(409)
          .json({
            success: false,
            message: "Only paid orders can be refunded",

          });
      }


      if (error.message === "PAYMENT_NOT_FOUND") {

        return res
          .status(404)
          .json({

            success: false,
            message: "Payment not found",

          });
      }


      if (error.message ==="PAYMENT_NOT_REFUNDABLE"   ) {
        return res
          .status(409)
          .json({

            success: false,
            message: "Payment has already been refunded or cannot be refunded",

          });
      }


      if ( error.message ===  "DUPLICATE_REFUND"     ) {

        return res
          .status(409)
          .json({

            success: false,
            message:  "Duplicate refund request rejected",

          });
      }


      console.error(
        "Refund error:",
        error
      );


      return res
        .status(500)
        .json({

          success: false,

          message: "Refund processing failed",

        });
    }
  };