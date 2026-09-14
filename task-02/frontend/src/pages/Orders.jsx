import {
  useEffect,
  useState,
} from "react";

import api from "../api/api.js";

import OrderStatus
  from "../components/OrderStatus.jsx";

import ConfirmModal
  from "../components/ConfirmModal.jsx";

import MessageModal
  from "../components/MessageModal.jsx";


function Orders() {

  const [orders, setOrders] =
    useState([]);

  const [
    selectedOrder,
    setSelectedOrder
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");


  // -----------------------------
  // Confirm modal
  // -----------------------------

  const [
    confirmModal,
    setConfirmModal
  ] = useState({
    open: false,
    type: null,
    orderId: null,
  });


  // -----------------------------
  // Success / error modal
  // -----------------------------

  const [
    messageModal,
    setMessageModal
  ] = useState({
    open: false,
    title: "",
    message: "",
  });


  // -----------------------------
  // Load order history
  // -----------------------------

  const loadOrders = async () => {

    try {

      setLoading(true);
      setMessage("");


      const response =
        await api.get("/orders");


      setOrders(
        response.data.data
      );


    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Failed to load order history"
      );


    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {

    loadOrders();

  }, []);


  // -----------------------------
  // Load order details
  // -----------------------------

  const loadOrderDetails =
    async (orderId) => {

      try {

        setMessage("");


        if (
          selectedOrder?.id ===
          orderId
        ) {

          setSelectedOrder(null);

          return;
        }


        const response =
          await api.get(
            `/orders/${orderId}`
          );


        setSelectedOrder(
          response.data.data
        );


      } catch (error) {

        setMessageModal({
          open: true,
          title:
            "Unable to Load Order",

          message:
            error.response?.data?.message ||
            "Failed to load order details",
        });
      }
    };


  // -----------------------------
  // Cancel order
  // -----------------------------

  const cancelOrder =
    async (orderId) => {

      try {

        const response =
          await api.post(
            `/orders/${orderId}/cancel`
          );


        setSelectedOrder(null);

        await loadOrders();


        setMessageModal({
          open: true,
          title:
            "Order Cancelled",

          message:
            response.data.message ||
            "Order cancelled successfully",
        });


      } catch (error) {

        setMessageModal({
          open: true,
          title:
            "Cancellation Failed",

          message:
            error.response?.data?.message ||
            "Failed to cancel order",
        });
      }
    };


  // -----------------------------
  // Refund order
  // -----------------------------

  const refundOrder =
    async (orderId) => {

      try {

        const idempotencyKey =
          `refund-order-${orderId}-${crypto.randomUUID()}`;


        const response =
          await api.post(
            `/orders/${orderId}/refund`,
            {
              idempotencyKey,

              reason:
                "Customer requested refund",
            }
          );


        setSelectedOrder(null);

        await loadOrders();


        setMessageModal({
          open: true,
          title:
            "Refund Successful",

          message:
            response.data.message ||
            "Refund processed successfully",
        });


      } catch (error) {

        setMessageModal({
          open: true,
          title:
            "Refund Failed",

          message:
            error.response?.data?.message ||
            "Failed to process refund",
        });
      }
    };


  // -----------------------------
  // Handle popup confirmation
  // -----------------------------

  const handleConfirmAction =
    async () => {

      const {
        type,
        orderId,
      } = confirmModal;


      setConfirmModal({
        open: false,
        type: null,
        orderId: null,
      });


      if (
        type === "refund"
      ) {

        await refundOrder(
          orderId
        );

      } else if (
        type === "cancel"
      ) {

        await cancelOrder(
          orderId
        );
      }
    };


  // -----------------------------
  // Format date
  // -----------------------------

  const formatDate = (
    date
  ) => {

    if (!date) {
      return "-";
    }


    return new Date(
      date
    ).toLocaleString(
      "en-LK",
      {
        timeZone:
          "Asia/Colombo",

        dateStyle:
          "medium",

        timeStyle:
          "short",
      }
    );
  };


  // -----------------------------
  // Loading
  // -----------------------------

  if (loading) {

    return (

      <div className="page">

        <h2>
          Loading order history...
        </h2>

      </div>
    );
  }


  return (

    <div className="page">


      <div className="page-header">

        <div>

          <h1>
            Order History
          </h1>

          <p>
            View your orders,
            payments and refunds.
          </p>

        </div>

      </div>


      {message && (

        <div className="message">
          {message}
        </div>

      )}


      {orders.length === 0 ? (

        <div className="card">

          <p>
            No orders found.
          </p>

        </div>

      ) : (

        <div>

          {orders.map(
            (order) => (

              <div
                className="card order-card"
                key={order.id}
              >


                {/* ORDER HEADER */}

                <div className="order-header">


                  <div>

                    <h3>
                      Order #{order.id}
                    </h3>

                    <p>
                      {formatDate(
                        order.created_at
                      )}
                    </p>

                  </div>


                  <OrderStatus
                    status={
                      order.status
                    }
                  />


                </div>


                {/* ORDER SUMMARY */}

                <p>

                  Total:{" "}

                  <strong>

                    Rs.{" "}
                    {order.total_amount}

                  </strong>

                </p>


                {order.payment_status && (

                  <p>

                    Payment:{" "}

                    <strong>
                      {
                        order.payment_status
                      }
                    </strong>

                  </p>

                )}


                {order.refund_status && (

                  <p>

                    Refund:{" "}

                    <strong>
                      {
                        order.refund_status
                      }
                    </strong>

                  </p>

                )}


                {/* ACTION BUTTONS */}

                <div className="order-actions">


                  <button
                    className="secondary-btn"

                    onClick={() =>
                      loadOrderDetails(
                        order.id
                      )
                    }
                  >

                    {selectedOrder?.id ===
                    order.id
                      ? "Hide Details"
                      : "View Details"}

                  </button>


                  {/* CANCEL RESERVED ORDER */}

                  {order.status ===
                    "RESERVED" && (

                    <button
                      className="danger-btn"

                      onClick={() =>
                        setConfirmModal({
                          open: true,
                          type: "cancel",
                          orderId:
                            order.id,
                        })
                      }
                    >

                      Cancel Order

                    </button>

                  )}


                  {/* REFUND PAID ORDER */}

                  {order.status ===
                    "PAID" && (

                    <button
                      className="danger-btn"

                      onClick={() =>
                        setConfirmModal({
                          open: true,
                          type: "refund",
                          orderId:
                            order.id,
                        })
                      }
                    >

                      Refund Order

                    </button>

                  )}


                </div>


                {/* ORDER DETAILS */}

                {selectedOrder?.id ===
                  order.id && (

                  <div className="order-details-inline">


                    <h3>
                      Order Details
                    </h3>


                    <p>

                      Status:{" "}

                      <strong>
                        {
                          selectedOrder.status
                        }
                      </strong>

                    </p>


                    <p>

                      Total:{" "}

                      <strong>

                        Rs.{" "}

                        {
                          selectedOrder
                            .total_amount
                        }

                      </strong>

                    </p>


                    <p>

                      Created:{" "}

                      {formatDate(
                        selectedOrder
                          .created_at
                      )}

                    </p>


                    {/* PRODUCTS */}

                    <h4>
                      Products
                    </h4>


                    {selectedOrder
                      .items
                      ?.map(
                        (item) => (

                          <div
                            className="order-item"

                            key={
                              item.product_id
                            }
                          >

                            <span>

                              <strong>
                                {
                                  item.product_name
                                }
                              </strong>

                            </span>


                            <span>

                              Qty:{" "}

                              {
                                item.quantity
                              }

                            </span>


                            <span>

                              Rs.{" "}

                              {
                                item.subtotal
                              }

                            </span>

                          </div>

                        )
                      )}


                    {/* PAYMENT */}

                    <h4>
                      Payment
                    </h4>


                    {selectedOrder
                      .payment ? (

                      <div>

                        <p>

                          Status:{" "}

                          <strong>

                            {
                              selectedOrder
                                .payment
                                .status
                            }

                          </strong>

                        </p>


                        <p>

                          Amount: Rs.{" "}

                          {
                            selectedOrder
                              .payment
                              .amount
                          }

                        </p>

                      </div>

                    ) : (

                      <p>
                        No payment recorded.
                      </p>

                    )}


                    {/* REFUND */}

                    <h4>
                      Refund
                    </h4>


                    {selectedOrder
                      .refund ? (

                      <div>

                        <p>

                          Status:{" "}

                          <strong>

                            {
                              selectedOrder
                                .refund
                                .status
                            }

                          </strong>

                        </p>


                        <p>

                          Amount: Rs.{" "}

                          {
                            selectedOrder
                              .refund
                              .amount
                          }

                        </p>


                        {selectedOrder
                          .refund
                          .reason && (

                          <p>

                            Reason:{" "}

                            {
                              selectedOrder
                                .refund
                                .reason
                            }

                          </p>

                        )}

                      </div>

                    ) : (

                      <p>
                        No refund recorded.
                      </p>

                    )}


                  </div>

                )}


              </div>

            )
          )}

        </div>

      )}


      {/* CONFIRM POPUP */}

      <ConfirmModal

        open={
          confirmModal.open
        }

        title={
          confirmModal.type ===
          "refund"
            ? "Refund Order"
            : "Cancel Order"
        }

        message={
          confirmModal.type ===
          "refund"
            ? "Are you sure you want to refund this order?"
            : "Are you sure you want to cancel this order?"
        }

        confirmText={
          confirmModal.type ===
          "refund"
            ? "Refund"
            : "Cancel Order"
        }

        cancelText="Back"

        onCancel={() =>
          setConfirmModal({
            open: false,
            type: null,
            orderId: null,
          })
        }

        onConfirm={
          handleConfirmAction
        }

      />


      {/* SUCCESS / ERROR POPUP */}

      <MessageModal

        open={
          messageModal.open
        }

        title={
          messageModal.title
        }

        message={
          messageModal.message
        }

        onClose={() =>
          setMessageModal({
            open: false,
            title: "",
            message: "",
          })
        }

      />


    </div>
  );
}


export default Orders;