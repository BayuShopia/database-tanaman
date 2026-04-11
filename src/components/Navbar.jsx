import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) =>
    location.pathname === path
      ? "text-green-600 font-bold"
      : "text-gray-600 hover:text-green-600";

  const MenuLink = ({ to, children }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`block py-2 ${isActive(to)}`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-black text-green-700">Berbumi</span>
        </div>

        {/* MENU DESKTOP */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link to="/" className={isActive("/")}>Dashboard</Link>
          <Link to="/karbon" className={isActive("/karbon")}>Hitung Karbon</Link>
          <Link to="/about" className={isActive("/about")}>About</Link>

          <button
            onClick={logout}
            className="ml-4 text-xs font-bold text-red-500 hover:text-red-600"
          >
            Keluar ({user.nama})
          </button>
        </div>

        {/* HAMBURGER BUTTON (MOBILE) */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* MENU MOBILE */}
      {open && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-2 shadow-lg animate-in fade-in slide-in-from-top duration-200">
          <MenuLink to="/">Dashboard</MenuLink>
          <MenuLink to="/karbon">Hitung Karbon</MenuLink>
          <MenuLink to="/about">About</MenuLink>

          <hr className="my-2" />

          <button
            onClick={logout}
            className="w-full text-left py-2 text-xs font-bold text-red-500"
          >
            Keluar ({user.nama})
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;