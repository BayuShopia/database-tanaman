function Footer() {
  return (
    <footer className="mt-12 pb-8 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-green-300 to-transparent mb-4"></div>

        <p className="text-xs font-medium text-gray-400 tracking-widest uppercase">
          © 2026 Berbumi Database
        </p>

        <a
          href="https://www.instagram.com/bayuutomo1618"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        >
          <span className="text-gray-500 text-[11px] font-bold uppercase tracking-tight group-hover:text-green-600 transition-colors">
            Developed by
          </span>
          <span className="text-sm font-black bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            bayuutomo1618
          </span>
        </a>

        <p className="text-[13px] text-gray-500 italic mt-2">
          Built with ❤️ for Forum DAS Bodri
        </p>
      </div>
    </footer>
  );
}

export default Footer;
