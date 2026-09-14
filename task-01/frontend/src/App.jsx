import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Products from "./pages/Products.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";



function App() {

  return (
    <BrowserRouter>

      <Routes>

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
          element={<Orders />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;