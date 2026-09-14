import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate
} from "react-router-dom";

import api from "../api/api.js";


function Checkout() {

  const navigate = useNavigate();
  const [cart, setCart] = useState(null);

  const [order, setOrder] =  useState(null);

  const [loading, setLoading] = useState(true);

  const [processing, setProcessing] =  useState(false);

  const [timeLeft, setTimeLeft] = useState(0);

  const [message, setMessage] = useState("");


  const cartId =localStorage.getItem("cartId");

  useEffect(() => {

    const loadCart = async () => {

      if (!cartId) {
        setLoading(false);
        return;
      }

      try {

        const response =
          await api.get(
            `/carts/${cartId}`
          );

        setCart(
          response.data.data
        );

      } catch (error) {

        console.error(error);

        setMessage(
          "Failed to load cart"
        );

      } finally {

        setLoading(false);

      }
    };


    loadCart();

  }, [cartId]);


  
  useEffect(() => {

    if (
      !order?.reservation_expires_at
    ) {
      return;
    }


    const calculateTime = () => {

      const expires =
        new Date(
          order.reservation_expires_at
        ).getTime();

      const now =
        new Date().getTime();

      const difference =
        Math.max(
          0,
          Math.floor(
            (expires - now) / 1000
          )
        );


      setTimeLeft(difference);
    };


    calculateTime();


    const timer = setInterval(
      calculateTime,
      1000
    );


    return () =>
      clearInterval(timer);

  }, [order]);


  const startCheckout = async () => {

    if (!cartId) {
      return;
    }


    try {

      setProcessing(true);
      setMessage("");


      const response =
        await api.post(
          `/carts/${cartId}/checkout`
        );


      const createdOrder =
        response.data.data;


      setOrder(
        createdOrder
      );


      localStorage.setItem(
        "activeOrderId",
        createdOrder.id
      );


      localStorage.removeItem(
        "cartId"
      );


      setMessage(
        "Stock reserved successfully."
      );


    } catch (error) {

      console.error(error);


      setMessage(
        error.response?.data?.message ||
        "Checkout failed"
      );

    } finally {

      setProcessing(false);

    }
  };


  const pay = async (outcome) => {

    if (!order) {
      return;
    }


    try {

      setProcessing(true);
      setMessage("");


      const idempotencyKey =
        `order-${order.id}-${crypto.randomUUID()}`;


      const response =
        await api.post(
          `/orders/${order.id}/payment`,
          {
            outcome,
            idempotencyKey,
          }
        );


      setMessage(
        response.data.message
      );


      // Get updated order state
      const updated =
        await api.get(
          `/orders/${order.id}`
        );


      setOrder(
        updated.data.data
      );


    } catch (error) {

      console.error(error);


      setMessage(
        error.response?.data?.message ||
        "Payment failed"
      );


      // Still refresh order because
      // failure/timeout may change status.
      try {

        const updated =
          await api.get(
            `/orders/${order.id}`
          );

        setOrder(
          updated.data.data
        );

      } catch {
        // ignore refresh error
      }

    } finally {

      setProcessing(false);

    }
  };


  // Countdown format

  const formatTime = (
    totalSeconds
  ) => {

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const seconds =
      totalSeconds % 60;


    return `${String(
      minutes
    ).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };


  if (loading) {

    return (
      <h2>
        Loading checkout...
      </h2>
    );
  }


  // After checkout

  if (order) {

    return (
      <div
        style={{
          padding: "20px",
        }}
      >

        <h1>
          Checkout
        </h1>


        <h2>
          Order #{order.id}
        </h2>


        <p>
          Status:{" "}
          <strong>
            {order.status}
          </strong>
        </p>


        <p>
          Total: Rs.{" "}
          {order.total_amount}
        </p>


        {order.status ===
          "RESERVED" && (

          <>
            <h3>
              Reservation expires in:
            </h3>

            <h1>
              {formatTime(
                timeLeft
              )}
            </h1>


            {timeLeft > 0 ? (

              <div>

                <h3>
                  Mock Payment
                </h3>


                <button
                  disabled={
                    processing
                  }
                  onClick={() =>
                    pay("success")
                  }
                >
                  Simulate Success
                </button>


                {" "}


                <button
                  disabled={
                    processing
                  }
                  onClick={() =>
                    pay("failure")
                  }
                >
                  Simulate Failure
                </button>


                {" "}


                <button
                  disabled={
                    processing
                  }
                  onClick={() =>
                    pay("timeout")
                  }
                >
                  Simulate Timeout
                </button>

              </div>

            ) : (

              <p>
                Reservation expired.
              </p>

            )}

          </>
        )}


        {order.status !==
          "RESERVED" && (

          <div>

            <h2>
              Order Status:
              {" "}
              {order.status}
            </h2>


            <button
              onClick={() =>
                navigate("/orders")
              }
            >
              View Orders
            </button>

          </div>

        )}


        {message && (
          <p>
            {message}
          </p>
        )}

      </div>
    );
  }


 
  if (!cart) {

    return (
      <div>
        <h1>Checkout</h1>

        <p>
          No active cart.
        </p>
      </div>
    );
  }


  return (
    <div
      style={{
        padding: "20px",
      }}
    >

      <h1>
        Checkout
      </h1>


      <h2>
        Order Summary
      </h2>


      {cart.items.map(
        (item) => (

          <div
            key={
              item.product_id
            }
          >

            <p>
              {item.name}
              {" × "}
              {item.quantity}
              {" = Rs. "}
              {item.subtotal}
            </p>

          </div>

        )
      )}


      <hr />


      <h2>
        Total: Rs.{" "}
        {cart.total}
      </h2>


      <button
        disabled={
          processing ||
          cart.items.length === 0
        }
        onClick={
          startCheckout
        }
      >

        {processing
          ? "Processing..."
          : "Reserve Stock & Checkout"}

      </button>


      {message && (
        <p>
          {message}
        </p>
      )}

    </div>
  );
}


export default Checkout;