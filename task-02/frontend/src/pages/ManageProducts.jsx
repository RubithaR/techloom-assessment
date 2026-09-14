import {
  useEffect,
  useState,
} from "react";

import api from "../api/api.js";

import ConfirmModal
  from "../components/ConfirmModal.jsx";

import MessageModal
  from "../components/MessageModal.jsx";


function ManageProducts() {

  const [products, setProducts] =
    useState([]);

  const [
    editingId,
    setEditingId
  ] = useState(null);


  const [
    form,
    setForm
  ] = useState({

    name: "",

    description: "",

    category: "",

    price: "",

    availableStock: "",

  });


  const [
    confirmModal,
    setConfirmModal
  ] = useState({

    open: false,

    productId: null,

  });


  const [
    messageModal,
    setMessageModal
  ] = useState({

    open: false,

    title: "",

    message: "",

  });


  // -------------------------
  // Load products
  // -------------------------

  const loadProducts =
    async () => {

      try {

        const response =
          await api.get(
            "/products"
          );


        setProducts(
          response.data.data
        );


      } catch (error) {

        setMessageModal({

          open: true,

          title:
            "Unable to Load Products",

          message:
            error.response?.data?.message ||
            "Failed to load products",

        });
      }
    };


  useEffect(() => {

    loadProducts();

  }, []);


  // -------------------------
  // Input changes
  // -------------------------

  const handleChange =
    (event) => {

      const {
        name,
        value
      } = event.target;


      setForm({

        ...form,

        [name]: value,

      });
    };


  // -------------------------
  // Reset form
  // -------------------------

  const resetForm = () => {

    setEditingId(null);


    setForm({

      name: "",

      description: "",

      category: "",

      price: "",

      availableStock: "",

    });
  };


  // -------------------------
  // Create / Update
  // -------------------------

  const handleSubmit =
    async (event) => {

      event.preventDefault();


      try {

        const payload = {

          name:
            form.name,

          description:
            form.description,

          category:
            form.category,

          price:
            Number(
              form.price
            ),

          availableStock:
            Number(
              form.availableStock
            ),

        };


        if (editingId) {

          await api.put(
            `/products/${editingId}`,
            payload
          );


          setMessageModal({

            open: true,

            title:
              "Product Updated",

            message:
              "Product updated successfully.",

          });


        } else {

          await api.post(
            "/products",
            payload
          );


          setMessageModal({

            open: true,

            title:
              "Product Created",

            message:
              "Product created successfully.",

          });
        }


        resetForm();

        await loadProducts();


      } catch (error) {

        setMessageModal({

          open: true,

          title:
            editingId
              ? "Update Failed"
              : "Create Failed",

          message:
            error.response?.data?.message ||
            "Failed to save product",

        });
      }
    };


  // -------------------------
  // Edit
  // -------------------------

  const editProduct =
    (product) => {

      setEditingId(
        product.id
      );


      setForm({

        name:
          product.name,

        description:
          product.description || "",

        category:
          product.category || "",

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


  // -------------------------
  // Delete
  // -------------------------

  const deleteProduct =
    async (productId) => {

      try {

        await api.delete(
          `/products/${productId}`
        );


        await loadProducts();


        setMessageModal({

          open: true,

          title:
            "Product Removed",

          message:
            "Product removed successfully.",

        });


      } catch (error) {

        setMessageModal({

          open: true,

          title:
            "Delete Failed",

          message:
            error.response?.data?.message ||
            "Failed to remove product",

        });
      }
    };


  // -------------------------
  // UI
  // -------------------------

  return (

    <div className="page">


      <div className="page-header">

        <div>

          <h1>
            Manage Products
          </h1>

          <p>
            Add, update and manage
            store inventory.
          </p>

        </div>

      </div>


      {/* FORM */}

      <div className="card admin-form-card">


        <h2>

          {editingId
            ? "Edit Product"
            : "Add Product"}

        </h2>


        <form
          className="admin-product-form"
          onSubmit={handleSubmit}
        >


          <div>

            <label>
              Product Name
            </label>

            <input
              type="text"
              name="name"

              value={
                form.name
              }

              onChange={
                handleChange
              }

              required
            />

          </div>


          <div>

            <label>
              Category
            </label>

            <input
              type="text"
              name="category"

              placeholder="Accessories"

              value={
                form.category
              }

              onChange={
                handleChange
              }

              required
            />

          </div>


          <div>

            <label>
              Price
            </label>

            <input
              type="number"
              name="price"

              min="0"
              step="0.01"

              value={
                form.price
              }

              onChange={
                handleChange
              }

              required
            />

          </div>


          <div>

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

              required
            />

          </div>


          <div className="full-width">

            <label>
              Description
            </label>

            <textarea
              name="description"

              rows="4"

              value={
                form.description
              }

              onChange={
                handleChange
              }

              placeholder="Product description"
            />

          </div>


          <div className="admin-form-actions">


            <button
              type="submit"
              className="primary-btn"
            >

              {editingId
                ? "Update Product"
                : "Add Product"}

            </button>


            {editingId && (

              <button
                type="button"
                className="secondary-btn"

                onClick={
                  resetForm
                }
              >

                Cancel Edit

              </button>

            )}


          </div>


        </form>


      </div>


      {/* INVENTORY */}

      <div className="card admin-table-card">


        <h2>
          Current Inventory
        </h2>


        {products.length === 0 ? (

          <p>
            No products available.
          </p>

        ) : (

          <div className="table-wrapper">


            <table className="admin-table">


              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Product
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Stock
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

                        <strong>
                          {
                            product.name
                          }
                        </strong>

                        {product.description && (

                          <div className="table-description">

                            {
                              product.description
                            }

                          </div>

                        )}

                      </td>


                      <td>

                        {
                          product.category
                        }

                      </td>


                      <td>

                        Rs.{" "}

                        {
                          product.price
                        }

                      </td>


                      <td>

                        <span
                          className={
                            product.available_stock >
                            0
                              ? "stock-active"
                              : "stock-empty"
                          }
                        >

                          {
                            product.available_stock
                          }

                        </span>

                      </td>


                      <td>

                        <div className="table-actions">


                          <button
                            className="secondary-btn"

                            onClick={() =>
                              editProduct(
                                product
                              )
                            }
                          >

                            Edit

                          </button>


                          <button
                            className="danger-btn"

                            onClick={() =>
                              setConfirmModal({

                                open: true,

                                productId:
                                  product.id,

                              })
                            }
                          >

                            Delete

                          </button>


                        </div>

                      </td>


                    </tr>

                  )
                )}


              </tbody>


            </table>


          </div>

        )}


      </div>


      {/* DELETE CONFIRMATION */}

      <ConfirmModal

        open={
          confirmModal.open
        }

        title="Remove Product"

        message=
          "Are you sure you want to remove this product from the store?"

        confirmText="Remove"

        cancelText="Back"

        onCancel={() =>
          setConfirmModal({

            open: false,

            productId: null,

          })
        }

        onConfirm={async () => {

          const productId =
            confirmModal.productId;


          setConfirmModal({

            open: false,

            productId: null,

          });


          await deleteProduct(
            productId
          );

        }}

      />


      {/* MESSAGE POPUP */}

      <MessageModal

        open={
          messageModal.open
        }

        title={
          messageModal.title
        }

        message={
          messageModal.message
        }

        onClose={() =>
          setMessageModal({

            open: false,

            title: "",

            message: "",

          })
        }

      />


    </div>
  );
}


export default ManageProducts;