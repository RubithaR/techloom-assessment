import pool from "../config/db.js";


export const getProducts = async ({search,category,minPrice, maxPrice,}) => {

  const conditions = ["is_active = TRUE"];
  const values = [];
  let index = 1;


  // Search by name or description
  if (search) {

    conditions.push(`
      ( name ILIKE $${index}
        OR description ILIKE $${index}   )
    `);

    values.push( `%${search}%` );

    index++;
  }


  // Filter by category
  if (category) {
    conditions.push( `category = $${index}`  );
    values.push(category);

    index++;
  }


  // Minimum price
  if (minPrice !== undefined) {

    conditions.push( `price >= $${index}` );
    values.push(minPrice);

    index++;
  }


  // Maximum price
  if (maxPrice !== undefined) {

    conditions.push( `price <= $${index}`  );

    values.push(maxPrice);

    index++;
  }


  const query = `
    SELECT
      id,
      name,
      description,
      category,
      price,
      available_stock,
      is_active,
      created_at,
      updated_at
    FROM products
    WHERE ${conditions.join(" AND ")}
    ORDER BY created_at DESC
  `;


  const result =
    await pool.query(
      query,
      values
    );


  return result.rows;
};

export const getProductById   = async(id) => {
    const result = await pool.query(
        `SELECT
        id,
        name,
        description,
        category,
        price,
        available_stock,
        is_active
      FROM products
      WHERE id = $1
        AND is_active = TRUE
        ` , 
        [id]
    );

    return result.rows[0];
};

export const createProduct= async( name,  description, category,price, availableStock  ) => {
  const result  = await pool.query(
    `INSERT INTO products (
        name,
        description,
        category,
        price,
        available_stock
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5
      )
      RETURNING * `,
    [  name,
        description || null,
        category || "General",
        price,
        availableStock  ]
  );

  return result.rows[0];
};

export const updateProduct = async (
  id,
  {name,description, category, price, availableStock, }
) => {

  const result =
    await pool.query(
      `
      UPDATE products
      SET
        name = $1,
        description = $2,
        category = $3,
        price = $4,
        available_stock = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
      `,
      [
        name,
        description || null,
        category || "General",
        price,
        availableStock,
        id,
      ]
    );


  return result.rows[0];
};



export const deleteProduct = async (
  id
) => {

  const result =
    await pool.query(
      `
      UPDATE products
      SET
        is_active = FALSE,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );


  return result.rows[0];
};