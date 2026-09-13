import pool from "../config/db.js";

export const getAllProducts = async () => {
    const result = await pool.query(
        `SELECT * FROM products ORDER BY id ASC`
    );
    return result.rows;

};

export const getAllProductById  = async(id) => {
    const result = await pool.query(
        `SELECT * FROM products WHERE id = $1` , 
        [id]
    );

    return result.rows[0];
};

export const createProduct= async( name,  price, availableStock) => {
  const result  = await pool.query(
    `INSERT INTO products(name, price, available_stock) VALUES ($1, $2, $3) RETURNING * `,
    [name, price, availableStock]
  );

  return result.rows[0];
};

export const updateProduct =async(id, name, price, availableStock ) => {
  const result= await pool.query(
    `UPDATE products SET name = $1, price = $2, available_stock = $3, updated_at = CURRENT_TIMESTAMP
    WHERE id = $4 RETURNING * `,
    [ name, price, availableStock,id]
  );

  return result.rows[0];
};

export const deleteProduct = async(id) => {
  const result =await pool.query(
    ` DELETE FROM products WHERE id = $1 RETURNING * `,
    [id]
  );

  return result.rows[0];
};