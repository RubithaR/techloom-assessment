import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar
  from "./components/Navbar.jsx";

import Products
  from "./pages/Products.jsx";

import ManageProducts
  from "./pages/ManageProducts.jsx";

import Cart
  from "./pages/Cart.jsx";

import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";
import ConcurrencyTest from "./pages/ConcurrencyTest.jsx";


function App() {

  return (

    <BrowserRouter>

      <Navbar />


      <Routes>

        {/* Customer / POS */}

        <Route
          path="/"
          element={
            <Products />
          }
        />


        <Route
          path="/cart"
          element={
            <Cart />
          }
        />


        <Route
          path="/checkout"
          element={
            <Checkout />
          }
        />


        <Route
          path="/orders"
          element={
            <Orders />
          }
        />


        {/* Admin / Inventory */}

        <Route
          path="/admin/products"
          element={
            <ManageProducts />
          }
        />

        <Route
          path="/admin/concurrency-test"
          element={<ConcurrencyTest />}
        />

      </Routes>

    </BrowserRouter>

  );
}


export default App;