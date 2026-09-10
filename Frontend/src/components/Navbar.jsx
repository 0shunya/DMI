import { useState } from "react";
import { NavLink } from "react-router-dom";

const links = [
  ["/", "Briefing"],
  ["/skills", "Skills"],
  ["/locations", "Places"],
  ["/compare", "Compare"],
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <NavLink to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">DMI</span>
          <span className="brand-name">Developer Market Intelligence</span>
        </NavLink>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="header-meta">
          <span className="edition">EDITION 09.10.26</span>
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation">
            <span />
            <span />
          </button>
        </div>
      </header>

      <aside className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-header">
          <span className="eyebrow">NAVIGATION</span>
          <button className="close-button" onClick={() => setMenuOpen(false)} aria-label="Close navigation">×</button>
        </div>
        <div className="mobile-menu-links">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} onClick={() => setMenuOpen(false)} className="mobile-nav-link">
              {label}
            </NavLink>
          ))}
        </div>
        <p className="mobile-note">A plain-language field guide to developer demand, salary, skills, and place.</p>
      </aside>
      {menuOpen && <button className="menu-overlay" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}
    </>
  );
}

export default Navbar;
