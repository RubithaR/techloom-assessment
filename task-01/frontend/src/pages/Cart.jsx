import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../api/api.js";
import CartItem from "../components/CartItem.jsx";


function Cart() {

  const navigate = useNavigate();

  const [cart, setCart] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");


  const cartId =
    localStorage.getItem(
      "cartId"
    );


  const loadCart = async () => {

    if (!cartId) {

      setCart(null);
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

      console.error(
        "Failed to load cart:",
        error
      );


      if (
        error.response?.status === 404
      ) {

        localStorage.removeItem(
          "cartId"
        );

        setCart(null);

      } else {

        setMessage(
          "Failed to load cart"
        );
      }

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadCart();

    // eslint-disable-next-line
  }, []);


  const updateQuantity = async (
    productId,
    quantity
  ) => {

    if (quantity < 1) {
      return;
    }


    try {

      setMessage("");


      await api.put(
        `/carts/${cartId}/items/${productId}`,
        {
          quantity,
        }
      );


      await loadCart();


    } catch (error) {

      console.error(
        "Update quantity error:",
        error
      );


      setMessage(
        error.response?.data?.message ||
        "Failed to update quantity"
      );
    }
  };


  const removeItem = async (
    productId
  ) => {

    try {

      setMessage("");


      await api.delete(
        `/carts/${cartId}/items/${productId}`
      );


      await loadCart();


    } catch (error) {

      console.error(
        "Remove item error:",
        error
      );


      setMessage(
        error.response?.data?.message ||
        "Failed to remove item"
      );
    }
  };


  if (loading) {

    return (

      <div className="page">

        <h2>
          Loading cart...
        </h2>

      </div>

    );
  }


  if (
    !cart ||
    cart.items?.length === 0
  ) {

    return (

      <div className="page">

        <h1>Your Cart</h1>

        <div className="card">

          <p>
            Your cart is empty.
          </p>


          <button
            onClick={() =>
              navigate("/")
            }
          >
            Browse Products
          </button>

        </div>

      </div>

    );
  }


  return (

    <div className="page">

      <div className="page-header">

        <div>

          <h1>Your Cart</h1>

          <p>
            Cart #{cart.id}
          </p>

        </div>


        <button
          className="secondary-btn"
          onClick={() =>
            navigate("/")
          }
        >
          Continue Shopping
        </button>

      </div>


      {message && (

        <div className="message">
          {message}
        </div>

      )}


      {cart.items.map(
        (item) => (

          <CartItem
            key={item.product_id}
            item={item}

            onIncrease={
              updateQuantity
            }

            onDecrease={
              updateQuantity
            }

            onRemove={
              removeItem
            }
          />

        )
      )}


      <div className="cart-summary">

        <h2>
          Total:
          {" "}
          Rs. {cart.total}
        </h2>


        <button
          onClick={() =>
            navigate(
              "/checkout"
            )
          }
        >
          Proceed to Checkout
        </button>

      </div>

    </div>

  );
}


export default Cart;