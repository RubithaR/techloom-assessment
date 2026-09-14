import {
  useEffect,
  useState,
} from "react";

import api from "../api/api.js";
import OrderStatus from "../components/OrderStatus.jsx";


function Orders() {

  const [orders, setOrders] = useState([]);

  const [
    selectedOrder,
    setSelectedOrder
  ] = useState(null);

  const [loading, setLoading] =  useState(true);

  const [message, setMessage] = useState("");


  const loadOrders = async () => {

    try {

      const response =
        await api.get(
          "/orders"
        );


      setOrders(
        response.data.data
      );


    } catch (error) {

      console.error(
        "Load orders error:",
        error
      );


      setMessage(
        "Failed to load orders"
      );


    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadOrders();

  }, []);


  const loadOrderDetails =
    async (orderId) => {

      try {

        setMessage("");


        const response =
          await api.get(
            `/orders/${orderId}`
          );


        setSelectedOrder(
          response.data.data
        );


      } catch (error) {

        console.error(
          "Order details error:",
          error
        );


        setMessage(
          error.response?.data?.message ||
          "Failed to load order details"
        );
      }
    };


  const cancelOrder =
    async (orderId) => {

      const confirmed =
        window.confirm(
          `Cancel Order #${orderId}?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setMessage("");


        const response =
          await api.post(
            `/orders/${orderId}/cancel`
          );


        setMessage(
          response.data.message
        );


        await loadOrders();


        if (
          selectedOrder?.id ===
          orderId
        ) {

          await loadOrderDetails(
            orderId
          );
        }


      } catch (error) {

        console.error(
          "Cancel order error:",
          error
        );


        setMessage(
          error.response?.data?.message ||
          "Failed to cancel order"
        );
      }
    };


  const canCancel = (
    status
  ) => {

    return (
      status === "RESERVED" ||
      status === "PAID"
    );
  };


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


  if (loading) {

    return (

      <div className="page">

        <h2>
          Loading orders...
        </h2>

      </div>

    );
  }


  return (

    <div className="page">

      <div className="page-header">

        <div>

          <h1>Orders</h1>

          <p>
            View and manage
            POS orders.
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
                key={order.id}
                className="card order-card"
              >

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


                <p>
                  Total:
                  {" "}
                  <strong>
                    Rs.{" "}
                    {order.total_amount}
                  </strong>
                </p>


                <p>
                  Stock Released:
                  {" "}
                  {order.stock_released
                    ? "Yes"
                    : "No"}
                </p>


                <button
                  className="secondary-btn"
                  onClick={() =>
                    loadOrderDetails(
                      order.id
                    )
                  }
                >
                  View Details
                </button>


                {" "}


                {canCancel(
                  order.status
                ) && (

                  <button
                    className="danger-btn"
                    onClick={() =>
                      cancelOrder(
                        order.id
                      )
                    }
                  >
                    Cancel Order
                  </button>

                )}

              </div>

            )
          )}

        </div>

      )}


      {selectedOrder && (

        <div className="order-details">

          <div className="order-header">

            <h2>
              Order #
              {selectedOrder.id}
            </h2>


            <OrderStatus
              status={
                selectedOrder.status
              }
            />

          </div>


          <p>
            Total:
            {" "}
            <strong>
              Rs.{" "}
              {
                selectedOrder
                  .total_amount
              }
            </strong>
          </p>


          <p>
            Created:
            {" "}
            {formatDate(
              selectedOrder
                .created_at
            )}
          </p>


          {selectedOrder
            .reservation_expires_at && (

            <p>
              Reservation Expiry:
              {" "}
              {formatDate(
                selectedOrder
                  .reservation_expires_at
              )}
            </p>

          )}


          <h3>
            Order Items
          </h3>


          {selectedOrder.items
            ?.map(
              (item) => (

                <div
                  key={
                    item.product_id
                  }
                  className="order-item"
                >

                  <strong>
                    {
                      item.product_name
                    }
                  </strong>

                  <span>
                    Qty:
                    {" "}
                    {item.quantity}
                  </span>

                  <span>
                    Rs.{" "}
                    {item.subtotal}
                  </span>

                </div>

              )
            )}


          <h3>
            Payment
          </h3>


          {selectedOrder.payment ? (

            <div className="payment-info">

              <p>
                Status:
                {" "}

                <strong>
                  {
                    selectedOrder
                      .payment
                      .status
                  }
                </strong>
              </p>


              <p>
                Amount:
                {" "}
                Rs.{" "}
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


          {canCancel(
            selectedOrder.status
          ) && (

            <button
              className="danger-btn"
              onClick={() =>
                cancelOrder(
                  selectedOrder.id
                )
              }
            >
              Cancel Order
            </button>

          )}

        </div>

      )}

    </div>

  );
}


export default Orders;