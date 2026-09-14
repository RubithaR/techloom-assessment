import * as orderService
  from "../services/orderService.js";


export const getOrders = async (req,res) => {

  try {
    const { status } =  req.query;
    const orders = await orderService.getAllOrders(status);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });


  } catch (error) {

    console.error(
      "Get orders error:",
      error   );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve order history"
    });
  }
};


export const getOrder = async (req,res) => {

  try {
    const { id } = req.params;

    const order = await orderService.getOrderById(id);


    if (!order) {

      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }


    res.status(200).json({
      success: true,
      data: order
    });


  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to retrieve order"
    });
  }
};


export const cancelOrder = async (req,res) => {

  try {
    const { id } = req.params;
    const order  =   await orderService.cancelOrder(id);


    res.status(200).json({
      success: true,
      message:
        "Order cancelled and stock restored successfully",
      data: order
    });


  } catch (error) {

    if (error.message === "ORDER_NOT_FOUND") {

      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }


    if ( error.message === "ORDER_NOT_CANCELLABLE") {

      return res.status(409).json({
        success: false,
        message:
          "Order cannot be cancelled in its current status"
      });
    }


    console.error(
      "Cancellation error:",
      error
    );


    res.status(500).json({
      success: false,
      message:
        "Failed to cancel order"
    });
  }
};