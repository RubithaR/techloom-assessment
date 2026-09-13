import * as checkoutService
  from "../services/checkoutService.js";


export const checkout = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await checkoutService.checkoutCart(id);

    res.status(201).json({
      success: true,
      message: "Stock reserved and order created successfully",
      data: order,
    });

  } catch (error) {
    if (error.message === "Cart_not_found") {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }


    if (error.message === "Cart_empty") {

      return res.status(400).json({
        success: false,
        message: "Cannot checkout an empty cart",
      });
    }


    if (error.message === "Cart_not_Active") {

      return res.status(409).json({
        success: false,
        message:
          "Cart has already been checked out or is no longer active",
      });
    }


    if ( error.message === "Order_already_exists") {

      return res.status(409).json({
        success: false,
        message:
          "An order already exists for this cart",
      });
    }


    if ( error.message === "Insufficient_stock"  ) {

      return res.status(409).json({
        success: false,
        message:
          `Insufficient stock for ${error.productName}`,
        availableStock:
          error.availableStock,
      });
    }


    if ( error.message === "Product_not_found" ) {

      return res.status(404).json({
        success: false,
        message:
          "One or more products no longer exist",
      });
    }


    console.error( "Checkout error:",  error  );

    res.status(500).json({
      success: false,
      message:
        "Checkout failed",
    });
  }
};