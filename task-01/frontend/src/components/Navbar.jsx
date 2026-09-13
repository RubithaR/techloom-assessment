import {
  NavLink
} from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        padding: "15px",
        borderBottom:
          "1px solid #ccc",
        marginBottom:
          "20px",
      }}
    >
      <strong>
        Techloom POS
      </strong>

      {" | "}

      <NavLink to="/">
        Products
      </NavLink>

      {" | "}

      <NavLink to="/cart">
        Cart
      </NavLink>

      {" | "}

      <NavLink to="/orders">
        Orders
      </NavLink>
    </nav>
  );
}

export default Navbar;