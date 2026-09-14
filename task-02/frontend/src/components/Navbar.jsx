import {
  NavLink
} from "react-router-dom";


function Navbar() {

  return (

    <nav className="navbar">

      <div className="nav-brand">
        Techloom Store
      </div>


      <div className="nav-links">

        <NavLink to="/">
          Products
        </NavLink>

        <NavLink to="/cart">
          Cart
        </NavLink>

        <NavLink to="/orders">
          Order History
        </NavLink>


        <span className="nav-section">
          ADMIN
        </span>


        <NavLink to="/admin/products">
          Manage Products
        </NavLink>

      </div>

    </nav>
  );
}


export default Navbar;