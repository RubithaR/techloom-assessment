import {
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import api
  from "../api/api.js";

import MessageModal
  from "./MessageModal.jsx";


function ProductCard({
  product
}) {

  const [
    messageModal,
    setMessageModal
  ] = useState({
    open: false,
    title: "",
    message: "",
  });


  const addToCart =
    async () => {

      try {

        let cartId =
          localStorage.getItem(
            "cartId"
          );


        // Create cart if there is no active cart
        if (!cartId) {

          const response =
            await api.post(
              "/carts"
            );


          cartId =
            response.data.data.id;


          localStorage.setItem(
            "cartId",
            cartId
          );
        }


        try {

          await api.post(
            `/carts/${cartId}/items`,
            {
              productId:
                product.id,

              quantity: 1,
            }
          );


        } catch (error) {

          // Existing cart may already
          // be checked out
          if (
            error.response?.status ===
            409
          ) {

            localStorage.removeItem(
              "cartId"
            );


            const response =
              await api.post(
                "/carts"
              );


            cartId =
              response.data.data.id;


            localStorage.setItem(
              "cartId",
              cartId
            );


            await api.post(
              `/carts/${cartId}/items`,
              {
                productId:
                  product.id,

                quantity: 1,
              }
            );


          } else {

            throw error;
          }
        }


        // Custom success popup
        setMessageModal({
          open: true,
          title:
            "Added to Cart",

          message:
            `${product.name} was added to your cart.`,
        });


      } catch (error) {

        // Custom error popup
        setMessageModal({
          open: true,
          title:
            "Unable to Add Product",

          message:
            error.response?.data?.message ||
            "Failed to add product to cart",
        });
      }
    };


  return (

    <div className="card product-card">


      <span className="category-label">

        {product.category}

      </span>


      <h3>
        {product.name}
      </h3>


      <p className="product-description">

        {product.description
          ? product.description.substring(
              0,
              90
            )
          : "No description available"}

      </p>


      <h3>
        Rs. {product.price}
      </h3>


      <p>

        Stock:{" "}

        <strong>
          {product.available_stock}
        </strong>

      </p>


      <div className="product-actions">


        <Link
          to={`/products/${product.id}`}
        >

          <button className="secondary-btn">

            View Details

          </button>

        </Link>


        <button
          className="primary-btn"

          disabled={
            product.available_stock <= 0
          }

          onClick={addToCart}
        >

          {product.available_stock > 0
            ? "Add to Cart"
            : "Out of Stock"}

        </button>


      </div>


      {/* CUSTOM POPUP */}

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


export default ProductCard;