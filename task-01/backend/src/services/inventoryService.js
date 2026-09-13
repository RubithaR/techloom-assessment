export const releaseOrderStock = async (
  client,
  orderId
) => {

  const itemsResult = await client.query(
    `
    SELECT
      product_id,
      quantity
    FROM order_items
    WHERE order_id = $1
    ORDER BY product_id
    `,
    [orderId]
  );

  for (const item of itemsResult.rows) {

    await client.query(
      `
      UPDATE products
      SET
        available_stock =
          available_stock + $1,
        updated_at = NOW()
      WHERE id = $2
      `,
      [
        item.quantity,
        item.product_id
      ]
    );
  }

  await client.query(
    `
    UPDATE orders
    SET
      stock_released = TRUE,
      updated_at = NOW()
    WHERE id = $1
    `,
    [orderId]
  );
};