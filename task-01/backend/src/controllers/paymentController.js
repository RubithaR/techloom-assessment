import * as paymentService
  from "../services/paymentService.js";


export const processPayment =
  async (req, res) => {

    try {

      const { id } = req.params;

      const {
        outcome,
        idempotencyKey
      } = req.body;


      if (!outcome || !idempotencyKey) {

        return res.status(400).json({
          success: false,
          message:
            "outcome and idempotencyKey are required"
        });
      }


      const allowedOutcomes = [
        "success",
        "failure",
        "timeout"
      ];


      if (!allowedOutcomes.includes(outcome)) {

        return res.status(400).json({
          success: false,
          message:
            "outcome must be success, failure or timeout"
        });
      }


      const result =
        await paymentService.processPayment(
          id,
          outcome,
          idempotencyKey
        );


      if ( result.code ==="RESERVATION_EXPIRED"  ) {

        return res.status(409).json({
          success: false,
          message:
            "Reservation has expired"
        });
      }


      res.status(200).json({
        success: true,
        message:
          `Payment processed with outcome: ${outcome}`,
        data: result
      });


    } catch (error) {


      if ( error.message === "ORDER_NOT_FOUND"  ) {

        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }


      if ( error.message ===  "DUPLICATE_PAYMENT"  ) {

        return res.status(409).json({
          success: false,
          message:
            "Duplicate payment submission rejected"
        });
      }


      if (  error.message ===   "ORDER_NOT_PAYABLE"    ) {

        return res.status(409).json({
          success: false,
          message:
            "This order is no longer payable"
        });
      }


      if ( error.message ===   "INVALID_PAYMENT_OUTCOME"    ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid payment outcome"
        });
      }


      console.error(
        "Payment error:",
        error
      );


      res.status(500).json({
        success: false,
        message:
          "Payment processing failed"
      });
    }
  };