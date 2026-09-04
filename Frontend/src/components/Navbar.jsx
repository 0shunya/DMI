import { useState } from "react";
import { NavLink } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">

        <NavLink
          to="/"
          className="navbar-brand"
          onClick={closeMenu}
        >
          DevMarket
        </NavLink>

        {/* Desktop Navigation */}

        <div className="navbar-links">

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/skills"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Skills
          </NavLink>

          <NavLink
            to="/locations"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Locations
          </NavLink>

          <NavLink
            to="/compare"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Compare
          </NavLink>

        </div>

        {/* Mobile Menu Button */}

        <button
          className="menu-button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </nav>

      {/* Mobile Side Menu */}

      <div
        className={`mobile-menu ${menuOpen ? "open" : ""}`}
      >

        <div className="mobile-menu-header">

          <span>Menu</span>

          <button
            className="close-button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
          >
            ×
          </button>

        </div>

        <div className="mobile-menu-links">

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "mobile-nav-link active" : "mobile-nav-link"
            }
            onClick={closeMenu}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/skills"
            className={({ isActive }) =>
              isActive ? "mobile-nav-link active" : "mobile-nav-link"
            }
            onClick={closeMenu}
          >
            Skills
          </NavLink>

          <NavLink
            to="/locations"
            className={({ isActive }) =>
              isActive ? "mobile-nav-link active" : "mobile-nav-link"
            }
            onClick={closeMenu}
          >
            Locations
          </NavLink>

          <NavLink
            to="/compare"
            className={({ isActive }) =>
              isActive ? "mobile-nav-link active" : "mobile-nav-link"
            }
            onClick={closeMenu}
          >
            Compare
          </NavLink>

        </div>

      </div>

      {/* Background Overlay */}

      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={closeMenu}
        ></div>
      )}
    </>
  );
}

export default Navbar;