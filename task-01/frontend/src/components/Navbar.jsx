import {
  NavLink,
} from "react-router-dom";


function Navbar() {

  return (

    <nav className="navbar">

      <div className="navbar-brand">

        Techloom POS

      </div>


      <div className="nav-section">

        <span className="nav-label">
          POS
        </span>


        <NavLink to="/">
          Products
        </NavLink>


        <NavLink to="/cart">
          Cart
        </NavLink>


        <NavLink to="/orders">
          Orders
        </NavLink>

      </div>


      <div className="nav-section">

        <span className="nav-label">
          Admin
        </span>


        <NavLink
          to="/admin/products"
        >
          Manage Inventory
        </NavLink>

        <NavLink
            to="/admin/concurrency-test"
        >
            Overselling Test
        </NavLink>

      </div>

    </nav>

  );
}


export default Navbar;