function Footer() {
  return (
    <footer className="mt-16 pb-8 pt-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <span className="text-lg">🌿</span>
            </div>
            <span className="font-black text-gray-900 text-lg">Berbumi</span>
          </div>

          {/* Copyright */}
          <p className="text-xs font-semibold text-gray-400 tracking-wider">
            © 2026 Berbumi Database — Forum DAS Bodri
          </p>

          {/* Developer */}
          <a
            href="https://www.instagram.com/bayuutomo1618"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:border-green-300 hover:shadow-md hover:shadow-green-100 transition-all duration-300 hover:-translate-y-0.5"
          >
            <span className="text-[11px] font-bold uppercase tracking-tight text-gray-400 group-hover:text-green-600 transition-colors">
              Developed by
            </span>
            <span className="text-sm font-black bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              bayuutomo1618
            </span>
          </a>

          {/* Tagline */}
          <p className="text-xs text-gray-400 italic mt-2">
            Built with ❤️ for a greener future
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
