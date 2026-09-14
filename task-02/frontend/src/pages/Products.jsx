import {
  useEffect,
  useState,
} from "react";

import api from "../api/api.js";

import ProductCard
  from "../components/ProductCard.jsx";


function Products() {
  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [minPrice, setMinPrice] =
    useState("");

  const [maxPrice, setMaxPrice] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");


  // Initial load
  useEffect(() => {
    let ignore = false;

    api
      .get("/products")

      .then((response) => {
        if (ignore) return;

        const data =
          response.data?.data;

        if (!Array.isArray(data)) {
          throw new Error(
            "Invalid product response"
          );
        }

        setProducts(data);
      })

      .catch((error) => {
        if (ignore) return;

        console.error(
          "Load products error:",
          error
        );

        setProducts([]);

        setMessage(
          error.response?.data?.message ||
          "Failed to load products"
        );
      })

      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });


    return () => {
      ignore = true;
    };
  }, []);


  const loadProducts =
    async () => {

      try {
        setLoading(true);
        setMessage("");

        const params = {};

        if (search.trim()) {
          params.search =
            search.trim();
        }

        if (category) {
          params.category =
            category;
        }

        if (minPrice) {
          params.minPrice =
            minPrice;
        }

        if (maxPrice) {
          params.maxPrice =
            maxPrice;
        }


        const response =
          await api.get(
            "/products",
            {
              params,
            }
          );


        const data =
          response.data?.data;


        if (!Array.isArray(data)) {
          throw new Error(
            "Invalid product response"
          );
        }


        setProducts(data);

      } catch (error) {

        console.error(
          "Load products error:",
          error
        );

        setProducts([]);

        setMessage(
          error.response?.data?.message ||
          "Failed to load products"
        );

      } finally {

        setLoading(false);
      }
    };


  const handleSearch =
    (event) => {

      event.preventDefault();

      loadProducts();
    };


  const clearFilters =
    async () => {

      setSearch("");
      setCategory("");
      setMinPrice("");
      setMaxPrice("");

      try {

        setLoading(true);
        setMessage("");

        const response =
          await api.get(
            "/products"
          );


        const data =
          response.data?.data;


        if (!Array.isArray(data)) {
          throw new Error(
            "Invalid product response"
          );
        }


        setProducts(data);

      } catch (error) {

        setProducts([]);

        setMessage(
          error.response?.data?.message ||
          "Failed to load products"
        );

      } finally {

        setLoading(false);
      }
    };


  return (
    <div className="page">

      <div className="page-header">
        <div>
          <h1>Products</h1>

          <p>
            Browse products and add
            items to your cart.
          </p>
        </div>
      </div>


      <form
        className="product-filters"
        onSubmit={handleSearch}
      >

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />


        <select
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value
            )
          }
        >

          <option value="">
            All Categories
          </option>

          <option value="Accessories">
            Accessories
          </option>

          <option value="Monitors">
            Monitors
          </option>

          <option value="Laptops">
            Laptops
          </option>

        </select>


        <input
          type="number"
          min="0"
          placeholder="Min Price"
          value={minPrice}
          onChange={(event) =>
            setMinPrice(
              event.target.value
            )
          }
        />


        <input
          type="number"
          min="0"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(event) =>
            setMaxPrice(
              event.target.value
            )
          }
        />


        <button
          type="submit"
          className="primary-btn"
        >
          Search
        </button>


        <button
          type="button"
          className="secondary-btn"
          onClick={clearFilters}
        >
          Clear
        </button>

      </form>


      {message && (
        <div className="message">
          {message}
        </div>
      )}


      {loading ? (

        <p>
          Loading products...
        </p>

      ) : products.length === 0 ? (

        <div className="card">
          <p>
            No products found.
          </p>
        </div>

      ) : (

        <div className="product-grid">

          {products.map(
            (product) => (

              <ProductCard
                key={product.id}
                product={product}
              />

            )
          )}

        </div>

      )}

    </div>
  );
}


export default Products;