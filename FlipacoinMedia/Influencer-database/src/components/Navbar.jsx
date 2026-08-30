
import { useState } from "react";
import { Link } from "react-router-dom"; 
import "../Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand-container">
          <div className="brand">
            <img
              src="/facm-logo.png"
              alt="FlipaCoin Media"
              className="brand-text"
            />

            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>
        </div>

        {/* ✅ Use Link instead of <a href="#"> */}
        <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/case-studies" onClick={() => setMenuOpen(false)}>Case Studies</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link to="/frenziedbook" onClick={() => setMenuOpen(false)}>FrienziedBook</Link>
          {/* <Link to="/creators" onClick={() => setMenuOpen(false)}>Creators</Link> */}
        </nav>
      </div>
    </header>
  );
}


