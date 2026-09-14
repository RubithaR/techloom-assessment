const BASE_URL = "http://localhost:5000/api";

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  return {
    status: response.status,
    data,
  };
};

const runTest = async () => {
  try {
    console.log("\n=== CONCURRENCY TEST START ===\n");

    // 1. Create a product with only 1 stock
    const productResponse = await request(
      `${BASE_URL}/products`,
      {
        method: "POST",
        body: JSON.stringify({
          name: `Concurrency Test Product ${Date.now()}`,
          price: 1000,
          availableStock: 1,
        }),
      }
    );

    const product =
      productResponse.data.data;

    console.log(
      "Created product:",
      product
    );

    console.log(
      `Initial stock: ${product.available_stock}`
    );


    // 2. Create Cart A
    const cartAResponse = await request(
      `${BASE_URL}/carts`,
      {
        method: "POST",
      }
    );

    const cartA =
      cartAResponse.data.data;


    // 3. Create Cart B
    const cartBResponse = await request(
      `${BASE_URL}/carts`,
      {
        method: "POST",
      }
    );

    const cartB =
      cartBResponse.data.data;


    console.log(
      `Cart A: ${cartA.id}`
    );

    console.log(
      `Cart B: ${cartB.id}`
    );


    // 4. Add same product to Cart A
    await request(
      `${BASE_URL}/carts/${cartA.id}/items`,
      {
        method: "POST",
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      }
    );


    // 5. Add same product to Cart B
    await request(
      `${BASE_URL}/carts/${cartB.id}/items`,
      {
        method: "POST",
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      }
    );


    console.log(
      "\nBoth carts contain the same product."
    );

    console.log(
      "Sending checkout requests simultaneously...\n"
    );


    // 6. Send both checkout requests at the same time
    const [
      checkoutA,
      checkoutB
    ] = await Promise.all([
      request(
        `${BASE_URL}/carts/${cartA.id}/checkout`,
        {
          method: "POST",
        }
      ),

      request(
        `${BASE_URL}/carts/${cartB.id}/checkout`,
        {
          method: "POST",
        }
      ),
    ]);


    console.log(
      "Cart A checkout:"
    );

    console.log(
      "HTTP status:",
      checkoutA.status
    );

    console.log(
      checkoutA.data
    );


    console.log(
      "\nCart B checkout:"
    );

    console.log(
      "HTTP status:",
      checkoutB.status
    );

    console.log(
      checkoutB.data
    );


    // 7. Check final product stock
    const finalProductResponse =
      await request(
        `${BASE_URL}/products/${product.id}`
      );


    const finalProduct =
      finalProductResponse.data.data;


    console.log(
      "\nFinal product stock:",
      finalProduct.available_stock
    );


    // 8. Evaluate test
    const results = [
      checkoutA.status,
      checkoutB.status,
    ];

    const successCount =
      results.filter(
        (status) => status === 201
      ).length;

    const rejectedCount =
      results.filter(
        (status) => status === 409
      ).length;


    console.log(
      "\n=== TEST RESULT ==="
    );


    if (
      successCount === 1 &&
      rejectedCount === 1 &&
      finalProduct.available_stock === 0
    ) {

      console.log(
        "✅ PASS: No overselling occurred"
      );

      console.log(
        "✅ Exactly one checkout succeeded"
      );

      console.log(
        "✅ Exactly one checkout was rejected"
      );

      console.log(
        "✅ Final stock is 0"
      );

    } else {

      console.log(
        "❌ FAIL: Concurrency protection is not working correctly"
      );

      console.log({
        successCount,
        rejectedCount,
        finalStock:
          finalProduct.available_stock,
      });
    }


    console.log(
      "\n=== CONCURRENCY TEST END ===\n"
    );

  } catch (error) {

    console.error(
      "Concurrency test failed:",
      error
    );
  }
};


runTest();