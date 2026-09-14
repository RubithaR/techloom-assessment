import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../api/api.js";


function ProductDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [
    product,
    setProduct
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    message,
    setMessage
  ] = useState("");


  useEffect(() => {

    loadProduct();

  }, [id]);


  const loadProduct =
    async () => {

      try {

        const response =
          await api.get(
            `/products/${id}`
          );

        setProduct(
          response.data.data
        );

      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Failed to load product"
        );

      } finally {

        setLoading(false);
      }
    };


  const addToCart =
    async () => {

      try {

        setMessage("");

        let cartId =
          localStorage.getItem(
            "cartId"
          );


        if (!cartId) {

          const cartResponse =
            await api.post(
              "/carts"
            );

          cartId =
            cartResponse.data.data.id;

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

          // Old cart may already
          // be checked out

          if (
            error.response?.status ===
            409
          ) {

            localStorage.removeItem(
              "cartId"
            );


            const cartResponse =
              await api.post(
                "/carts"
              );


            cartId =
              cartResponse.data.data.id;


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


        setMessage(
          "Product added to cart"
        );


      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Failed to add product to cart"
        );
      }
    };


  if (loading) {

    return (
      <div className="page">
        <p>
          Loading product...
        </p>
      </div>
    );
  }


  if (!product) {

    return (
      <div className="page">

        <button
          className="secondary-btn"
          onClick={() =>
            navigate("/")
          }
        >
          ← Back to Products
        </button>

        <p>
          {message ||
            "Product not found"}
        </p>

      </div>
    );
  }


  return (

    <div className="page">

      <button
        className="secondary-btn"
        onClick={() =>
          navigate("/")
        }
      >
        ← Back to Products
      </button>


      <div className="product-details">

        <p className="category-label">
          {product.category}
        </p>


        <h1>
          {product.name}
        </h1>


        <p className="product-description">
          {product.description ||
            "No description available."}
        </p>


        <h2>
          Rs. {product.price}
        </h2>


        <p>
          Available Stock:{" "}
          <strong>
            {
              product.available_stock
            }
          </strong>
        </p>


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


        {" "}


        <Link to="/cart">
          <button className="secondary-btn">
            Go to Cart
          </button>
        </Link>


        {message && (
          <p className="message">
            {message}
          </p>
        )}

      </div>

    </div>
  );
}


export default ProductDetails;