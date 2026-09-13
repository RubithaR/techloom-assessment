import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../api/api.js";
import ProductCard from "../components/ProductCard.jsx";


function Products() {

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");


  useEffect(() => {

    const loadProducts = async () => {

      try {

        const response =
          await api.get("/products");

        setProducts(
          response.data.data
        );

      } catch (error) {

        console.error(
          "Failed to load products:",
          error
        );

        setMessage(
          "Failed to load products"
        );

      } finally {

        setLoading(false);

      }
    };


    loadProducts();

  }, []);


  const createCart = async () => {

    const response =
      await api.post("/carts");

    const cartId =
      response.data.data.id;

    localStorage.setItem(
      "cartId",
      cartId
    );

    return cartId;
  };


  const addToCart = async (
    productId
  ) => {

    try {

      setMessage("");

      let cartId =
        localStorage.getItem(
          "cartId"
        );


      if (!cartId) {

        cartId =
          await createCart();

      }


      try {

        await api.post(
          `/carts/${cartId}/items`,
          {
            productId,
            quantity: 1,
          }
        );

      } catch (error) {

        /*
          If old cart was already
          CHECKED_OUT, create a new cart.
        */

        if (
          error.response?.status === 409
        ) {

          localStorage.removeItem(
            "cartId"
          );

          cartId =
            await createCart();


          await api.post(
            `/carts/${cartId}/items`,
            {
              productId,
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

      console.error(
        "Add to cart error:",
        error
      );


      setMessage(
        error.response?.data?.message ||
        "Failed to add product"
      );
    }
  };


  if (loading) {

    return (
      <div className="page">
        <h2>
          Loading products...
        </h2>
      </div>
    );
  }


  return (

    <div className="page">

      <div className="page-header">

        <div>
          <h1>Products</h1>

          <p>
            Select products for
            your POS order.
          </p>
        </div>


        <button
          className="secondary-btn"
          onClick={() =>
            navigate("/cart")
          }
        >
          Go to Cart
        </button>

      </div>


      {message && (

        <div className="message">
          {message}
        </div>

      )}


      {products.length === 0 ? (

        <p>
          No products available.
        </p>

      ) : (

        <div className="product-grid">

          {products.map(
            (product) => (

              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={
                  addToCart
                }
              />

            )
          )}

        </div>

      )}

    </div>

  );
}


export default Products;