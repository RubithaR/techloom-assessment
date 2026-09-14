import {
  useEffect,
  useState,
} from "react";

import api from "../api/api.js";


function ConcurrencyTest() {

  const [products, setProducts] =
    useState([]);

  const [productId, setProductId] =
    useState("");

  const [running, setRunning] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [message, setMessage] =
    useState("");


  const loadProducts = async () => {

    try {

      const response =
        await api.get("/products");

      setProducts(
        response.data.data
      );

    } catch (error) {

      console.error(error);

      setMessage(
        "Failed to load products"
      );
    }
  };


  useEffect(() => {

    loadProducts();

  }, []);


  const selectedProduct =
    products.find(
      (product) =>
        product.id ===
        Number(productId)
    );


  const createCartWithItem =
    async (
      selectedProductId,
      quantity
    ) => {

      const cartResponse =
        await api.post("/carts");

      const cartId =
        cartResponse.data.data.id;


      await api.post(
        `/carts/${cartId}/items`,
        {
          productId:
            selectedProductId,

          quantity,
        }
      );


      return cartId;
    };


  const runConcurrencyTest =
    async () => {

      if (!selectedProduct) {

        setMessage(
          "Please select a product"
        );

        return;
      }


      if (
        selectedProduct
          .available_stock <= 0
      ) {

        setMessage(
          "Select a product that has available stock"
        );

        return;
      }


      try {

        setRunning(true);

        setMessage("");

        setResult(null);


        /*
          Each cart requests ALL currently
          available stock.

          Example:
          stock = 4

          Cart A requests 4
          Cart B requests 4

          Only ONE should succeed.
        */

        const quantity =
          selectedProduct
            .available_stock;


        // Create two separate carts

        const [
          cartA,
          cartB
        ] = await Promise.all([

          createCartWithItem(
            selectedProduct.id,
            quantity
          ),

          createCartWithItem(
            selectedProduct.id,
            quantity
          ),

        ]);


        // --------------------------------
        // Send checkouts simultaneously
        // --------------------------------

        const [
          checkoutA,
          checkoutB
        ] = await Promise.allSettled([

          api.post(
            `/carts/${cartA}/checkout`
          ),

          api.post(
            `/carts/${cartB}/checkout`
          ),

        ]);


        const normalizeResult =
          (response) => {

            if (
              response.status ===
              "fulfilled"
            ) {

              return {
                status:
                  response.value.status,

                success: true,

                message:
                  response.value.data
                    .message,
              };
            }


            return {
              status:
                response.reason
                  ?.response
                  ?.status,

              success: false,

              message:
                response.reason
                  ?.response
                  ?.data
                  ?.message ||
                "Request failed",
            };
          };


        const resultA =
          normalizeResult(
            checkoutA
          );

        const resultB =
          normalizeResult(
            checkoutB
          );


        // Get latest stock

        const finalProductResponse =
          await api.get(
            `/products/${selectedProduct.id}`
          );


        const finalStock =
          finalProductResponse
            .data
            .data
            .available_stock;


        const successes = [
          resultA,
          resultB,
        ].filter(
          (item) =>
            item.status === 201
        ).length;


        const rejected = [
          resultA,
          resultB,
        ].filter(
          (item) =>
            item.status === 409
        ).length;


        const passed =
          successes === 1 &&
          rejected === 1 &&
          finalStock === 0;


        setResult({

          product:
            selectedProduct.name,

          originalStock:
            selectedProduct
              .available_stock,

          quantityPerCart:
            quantity,

          cartA,
          cartB,

          resultA,
          resultB,

          finalStock,

          passed,

        });


        await loadProducts();


      } catch (error) {

        console.error(
          "Concurrency test error:",
          error
        );


        setMessage(
          error.response?.data?.message ||
          "Concurrency test failed"
        );


      } finally {

        setRunning(false);

      }
    };


  return (

    <div className="page">

      <div className="page-header">

        <div>

          <h1>
            Overselling Test
          </h1>

          <p>
            Simulate two customers
            purchasing the same
            limited-stock product
            simultaneously.
          </p>

        </div>

      </div>


      {message && (

        <div className="message">
          {message}
        </div>

      )}


      <div className="admin-form">

        <div className="form-group">

          <label>
            Select Product
          </label>


          <select
            value={productId}
            onChange={(event) =>
              setProductId(
                event.target.value
              )
            }
          >

            <option value="">
              Select product
            </option>


            {products.map(
              (product) => (

                <option
                  key={product.id}
                  value={product.id}
                  disabled={
                    product
                      .available_stock <=
                    0
                  }
                >

                  {product.name}
                  {" — Stock: "}
                  {
                    product
                      .available_stock
                  }

                </option>

              )
            )}

          </select>

        </div>


        {selectedProduct && (

          <div>

            <p>
              Current Stock:
              {" "}
              <strong>
                {
                  selectedProduct
                    .available_stock
                }
              </strong>
            </p>


            <p>
              Both carts will attempt
              to purchase:
              {" "}
              <strong>
                {
                  selectedProduct
                    .available_stock
                }
              </strong>
              {" "}
              units each.
            </p>

          </div>

        )}


        <button
          onClick={
            runConcurrencyTest
          }
          disabled={
            running ||
            !selectedProduct
          }
        >

          {running
            ? "Running Test..."
            : "Run Overselling Test"}

        </button>

      </div>


      {result && (

        <div className="concurrency-result">

          <h2>
            Test Result
          </h2>


          <div
            className={
              result.passed
                ? "test-pass"
                : "test-fail"
            }
          >

            {result.passed
              ? "✅ PASS — Overselling prevented"
              : "❌ FAIL — Overselling protection failed"}

          </div>


          <p>
            Product:
            {" "}
            <strong>
              {result.product}
            </strong>
          </p>


          <p>
            Initial Stock:
            {" "}
            {
              result.originalStock
            }
          </p>


          <p>
            Quantity requested
            by each cart:
            {" "}
            {
              result.quantityPerCart
            }
          </p>


          <hr />


          <h3>
            Customer A
          </h3>


          <p>
            Cart:
            {" "}
            #{result.cartA}
          </p>


          <p>
            HTTP Status:
            {" "}
            {
              result.resultA.status
            }
          </p>


          <p>
            {
              result.resultA.message
            }
          </p>


          <hr />


          <h3>
            Customer B
          </h3>


          <p>
            Cart:
            {" "}
            #{result.cartB}
          </p>


          <p>
            HTTP Status:
            {" "}
            {
              result.resultB.status
            }
          </p>


          <p>
            {
              result.resultB.message
            }
          </p>


          <hr />


          <h3>
            Final Stock:
            {" "}
            {result.finalStock}
          </h3>

        </div>

      )}


      <div className="test-info">

        <h3>
          Expected Behaviour
        </h3>

        <p>
          Both checkout requests are
          sent simultaneously using
          Promise.allSettled().
        </p>


        <p>
          PostgreSQL row locking with
          SELECT ... FOR UPDATE ensures
          that only one transaction can
          reserve the stock.
        </p>


        <p>
          Expected result:
        </p>


        <pre>
{`Customer A → 201 RESERVED
Customer B → 409 Insufficient Stock

OR

Customer B → 201 RESERVED
Customer A → 409 Insufficient Stock

Final available stock = 0`}
        </pre>


        <p>
          The successful reservation
          will automatically expire
          after 5 minutes if payment
          is not completed, and the
          stock will be restored.
        </p>

      </div>

    </div>

  );
}


export default ConcurrencyTest;