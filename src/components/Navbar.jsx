import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Tutup menu setiap pindah halaman
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock scroll saat menu mobile terbuka
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const linkClass = ({ isActive }) =>
    `block py-2 ${
      isActive
        ? "text-green-600 font-bold"
        : "text-gray-700 hover:text-green-600"
    }`;

  return (
    <>
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="font-black text-green-700">Berbumi</span>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
            <NavLink to="/karbon" className={linkClass}>Hitung Karbon</NavLink>
            <NavLink to="/rumah-bibit" className={linkClass}>Rumah Bibit</NavLink>
            <NavLink to="/riwayat-bibit-keluar" className={linkClass}>
              Riwayat Bibit
            </NavLink>
            <NavLink to="/about" className={linkClass}>About</NavLink>

            <button
              onClick={logout}
              className="ml-4 text-xs font-bold text-red-500 hover:text-red-600"
            >
              Keluar ({user.nama})
            </button>
          </div>

          {/* HAMBURGER */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setOpen(true)}
            aria-label="Toggle Menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* MOBILE OVERLAY MENU */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* MENU PANEL */}
          <div className="absolute top-0 right-0 w-64 h-full bg-white shadow-xl p-6 space-y-4 animate-in slide-in-from-right duration-200">
            <button
              className="text-2xl mb-4"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
            <NavLink to="/karbon" className={linkClass}>Hitung Karbon</NavLink>
            <NavLink to="/rumah-bibit" className={linkClass}>Rumah Bibit</NavLink>
            <NavLink to="/riwayat-bibit-keluar" className={linkClass}>
              Riwayat Bibit
            </NavLink>
            <NavLink to="/about" className={linkClass}>About</NavLink>

            <hr />

            <button
              onClick={logout}
              className="w-full text-left py-2 text-xs font-bold text-red-500"
            >
              Keluar ({user.nama})
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;