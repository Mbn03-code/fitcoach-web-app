import { useState } from "react";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function TopNav() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className="top-nav">
      <Logo />

      <nav className="desktop-nav">
        <a href="#workouts">Workouts</a>
        <a href="#coaches">Coaches</a>
        <Link to="/exercises">Exercises</Link>
        <a href="#stories">Stories</a>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        {isAuthenticated && <Link to="/dashboard">Dashboard</Link>}
      </nav>

      <div className="desktop-actions">
        {isAuthenticated ? (
          <Link to="/dashboard" className="nav-cta">
            <LayoutDashboard size={17} />
            Dashboard
          </Link>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="nav-cta">
              Build Your Plan
            </Link>
          </>
        )}
      </div>

      <button
        type="button"
        className="hamburger"
        aria-label="Open menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={25} /> : <Menu size={25} />}
      </button>

      {open && (
        <div className="mobile-menu">
          <a href="#workouts" onClick={closeMenu}>
            Workouts
          </a>
          <a href="#coaches" onClick={closeMenu}>
            Coaches
          </a>
          <Link to="/exercises" onClick={closeMenu}>
            Exercises
          </Link>
          <a href="#stories" onClick={closeMenu}>
            Stories
          </a>
          <Link to="/about" onClick={closeMenu}>
            About
          </Link>
          <Link to="/contact" onClick={closeMenu}>
            Contact
          </Link>
          <Link to="/legal" onClick={closeMenu}>
            Privacy / Terms / Support
          </Link>

          <div className="mobile-menu-actions">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="mobile-menu-cta"
                onClick={closeMenu}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu}>
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="mobile-menu-cta"
                  onClick={closeMenu}
                >
                  Build Your Plan
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
