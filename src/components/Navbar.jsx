import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: "🌿", end: true },
  { to: "/karbon", label: "Hitung Karbon", icon: "🌳" },
  { to: "/rumah-bibit", label: "Rumah Bibit", icon: "🏠" },
  { to: "/riwayat-bibit-keluar", label: "Riwayat Bibit", icon: "📦" },
  { to: "/about", label: "About", icon: "ℹ️" },
];

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const roleColors = {
    admin: "bg-purple-100 text-purple-700",
    surveyor: "bg-blue-100 text-blue-700",
    petugas_bibit: "bg-amber-100 text-amber-700",
    guest: "bg-gray-100 text-gray-600",
  };

  const roleLabel = {
    admin: "Admin",
    surveyor: "Surveyor",
    petugas_bibit: "Petugas Bibit",
    guest: "Guest",
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/50"
          : "bg-white border-b border-gray-100"
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm shadow-green-200 group-hover:shadow-green-300 transition-shadow">
              <span className="text-sm">🌿</span>
            </div>
            <span className="font-black text-gray-900 tracking-tight text-lg">Berbumi</span>
          </NavLink>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-green-50 text-green-700"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* User + Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                <span className="text-sm font-black text-green-700">
                  {user?.nama?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-800 leading-none">{user?.nama}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${roleColors[user?.role] || roleColors.guest}`}>
                  {roleLabel[user?.role] || "Guest"}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <span>🚪</span>
              Keluar
            </button>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(true)}
            aria-label="Buka Menu"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="absolute top-0 right-0 w-72 h-full bg-white shadow-2xl flex flex-col animate-slide-up">
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-base font-black text-white">{user?.nama?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-800">{user?.nama}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${roleColors[user?.role] || roleColors.guest}`}>
                    {roleLabel[user?.role] || "Guest"}
                  </span>
                </div>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setOpen(false)}
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-green-50 text-green-700 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Logout */}
            <div className="p-4 border-t">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all"
              >
                <span>🚪</span>
                Keluar dari Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
