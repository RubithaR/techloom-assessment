import {
  useEffect,
  useState,
} from "react";

import api from "../api/api.js";


const emptyForm = {
  name: "",
  price: "",
  availableStock: "",
};


function ManageProducts() {

  const [products, setProducts] =
    useState([]);

  const [form, setForm] =
    useState(emptyForm);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");


  // ---------------------------
  // Load products
  // ---------------------------

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

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadProducts();

  }, []);


  // ---------------------------
  // Form input
  // ---------------------------

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  // ---------------------------
  // Create / Update
  // ---------------------------

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    if (
      !form.name.trim() ||
      form.price === "" ||
      form.availableStock === ""
    ) {

      setMessage(
        "Please complete all fields"
      );

      return;
    }


    if (
      Number(form.price) < 0 ||
      Number(form.availableStock) < 0
    ) {

      setMessage(
        "Price and stock cannot be negative"
      );

      return;
    }


    try {

      setSaving(true);
      setMessage("");


      const payload = {

        name:
          form.name.trim(),

        price:
          Number(form.price),

        availableStock:
          Number(
            form.availableStock
          ),
      };


      // EDIT

      if (editingId) {

        await api.put(
          `/products/${editingId}`,
          payload
        );


        setMessage(
          "Product updated successfully"
        );

      }

      // CREATE

      else {

        await api.post(
          "/products",
          payload
        );


        setMessage(
          "Product created successfully"
        );

      }


      setForm(emptyForm);

      setEditingId(null);

      await loadProducts();


    } catch (error) {

      console.error(error);


      setMessage(
        error.response?.data?.message ||
        "Failed to save product"
      );


    } finally {

      setSaving(false);

    }
  };


  // ---------------------------
  // Edit product
  // ---------------------------

  const startEdit = (
    product
  ) => {

    setEditingId(
      product.id
    );


    setForm({

      name:
        product.name,

      price:
        product.price,

      availableStock:
        product.available_stock,

    });


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  // ---------------------------
  // Cancel edit
  // ---------------------------

  const cancelEdit = () => {

    setEditingId(null);

    setForm(emptyForm);

    setMessage("");

  };


  // ---------------------------
  // Delete product
  // ---------------------------

  const deleteProduct = async (
    product
  ) => {

    const confirmed =
      window.confirm(
        `Delete "${product.name}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setMessage("");


      await api.delete(
        `/products/${product.id}`
      );


      setMessage(
        "Product deleted successfully"
      );


      if (
        editingId === product.id
      ) {

        cancelEdit();

      }


      await loadProducts();


    } catch (error) {

      console.error(error);


      setMessage(
        error.response?.data?.message ||
        "Failed to delete product"
      );

    }
  };


  if (loading) {

    return (

      <div className="page">

        <h2>
          Loading inventory...
        </h2>

      </div>

    );
  }


  return (

    <div className="page">

      <div className="page-header">

        <div>

          <h1>
            Inventory Management
          </h1>

          <p>
            Manage products and
            current stock levels.
          </p>

        </div>

      </div>


      {message && (

        <div className="message">
          {message}
        </div>

      )}


      {/* CREATE / EDIT FORM */}

      <div className="admin-form">

        <h2>

          {editingId
            ? "Edit Product"
            : "Create Product"}

        </h2>


        <form
          onSubmit={
            handleSubmit
          }
        >

          <div className="form-group">

            <label>
              Product Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={
                handleChange
              }
              placeholder="Example: Mechanical Keyboard"
            />

          </div>


          <div className="form-group">

            <label>
              Price (Rs.)
            </label>

            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              value={form.price}
              onChange={
                handleChange
              }
              placeholder="14500"
            />

          </div>


          <div className="form-group">

            <label>
              Available Stock
            </label>

            <input
              type="number"
              name="availableStock"
              min="0"
              value={
                form.availableStock
              }
              onChange={
                handleChange
              }
              placeholder="10"
            />

          </div>


          <div className="form-actions">

            <button
              type="submit"
              disabled={saving}
            >

              {saving
                ? "Saving..."
                : editingId
                ? "Update Product"
                : "Create Product"}

            </button>


            {editingId && (

              <button
                type="button"
                className="secondary-btn"
                onClick={
                  cancelEdit
                }
              >
                Cancel
              </button>

            )}

          </div>

        </form>

      </div>


      {/* PRODUCT TABLE */}

      <div className="inventory-section">

        <h2>
          Current Inventory
        </h2>


        <div className="table-container">

          <table className="inventory-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>
                  Product
                </th>

                <th>
                  Price
                </th>

                <th>
                  Available Stock
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {products.map(
                (product) => (

                  <tr
                    key={
                      product.id
                    }
                  >

                    <td>
                      {product.id}
                    </td>


                    <td>
                      {product.name}
                    </td>


                    <td>
                      Rs.{" "}
                      {product.price}
                    </td>


                    <td>

                      <span
                        className={
                          product
                            .available_stock ===
                          0
                            ? "stock-out"
                            : "stock-available"
                        }
                      >

                        {
                          product.available_stock
                        }

                      </span>

                    </td>


                    <td>

                      <button
                        className="edit-btn"
                        onClick={() =>
                          startEdit(
                            product
                          )
                        }
                      >
                        Edit
                      </button>


                      {" "}


                      <button
                        className="danger-btn"
                        onClick={() =>
                          deleteProduct(
                            product
                          )
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}


export default ManageProducts;