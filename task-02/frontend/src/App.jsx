import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Navbar
  from "./components/Navbar.jsx";

import Products
  from "./pages/Products.jsx";

import ProductDetails
  from "./pages/ProductDetails.jsx";

import Cart
  from "./pages/Cart.jsx";

import Checkout
  from "./pages/Checkout.jsx";

import Orders
  from "./pages/Orders.jsx";

import ManageProducts
  from "./pages/ManageProducts.jsx";
  

function App() {

  return (

    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Products />}
        />

        <Route
          path="/products/:id"
          element={
            <ProductDetails />
          }
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/orders"
          element={<Orders />}
        />
        <Route
          path="/admin/products"
          element={<ManageProducts />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;