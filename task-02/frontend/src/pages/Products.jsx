import {
  useEffect,
  useState,
} from "react";

import api
  from "../api/api.js";

import ProductCard
  from "../components/ProductCard.jsx";


function Products() {

  const [
    products,
    setProducts
  ] = useState([]);

  const [
    search,
    setSearch
  ] = useState("");

  const [
    category,
    setCategory
  ] = useState("");

  const [
    minPrice,
    setMinPrice
  ] = useState("");

  const [
    maxPrice,
    setMaxPrice
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    message,
    setMessage
  ] = useState("");


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
            { params }
          );


        setProducts(
          response.data.data
        );


      } catch (error) {

        setMessage(
          error.response?.data?.message ||
          "Failed to load products"
        );

      } finally {

        setLoading(false);
      }
    };


  useEffect(() => {

    loadProducts();

  }, []);


  const handleSearch =
    (event) => {

      event.preventDefault();

      loadProducts();
    };


  const clearFilters =
    () => {

      setSearch("");
      setCategory("");
      setMinPrice("");
      setMaxPrice("");


      setTimeout(() => {

        api.get(
          "/products"
        )
        .then((response) => {

          setProducts(
            response.data.data
          );

        });

      }, 0);
    };


  return (

    <div className="page">

      <div className="page-header">

        <div>
          <h1>
            Products
          </h1>

          <p>
            Browse products and
            add items to your cart.
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
          placeholder="Min Price"
          min="0"
          value={minPrice}
          onChange={(event) =>
            setMinPrice(
              event.target.value
            )
          }
        />


        <input
          type="number"
          placeholder="Max Price"
          min="0"
          value={maxPrice}
          onChange={(event) =>
            setMaxPrice(
              event.target.value
            )
          }
        />


        <button
          className="primary-btn"
          type="submit"
        >
          Search
        </button>


        <button
          className="secondary-btn"
          type="button"
          onClick={clearFilters}
        >
          Clear
        </button>

      </form>


      {message && (
        <p className="message">
          {message}
        </p>
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
                onCartUpdated={
                  loadProducts
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