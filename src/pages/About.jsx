function About() {
  const features = [
    { icon: "🌿", title: "Database Pohon", desc: "Monitoring real-time kondisi pohon yang ditanam" },
    { icon: "🌳", title: "Hitung Karbon", desc: "Estimasi serapan CO₂ menggunakan metode ilmiah" },
    { icon: "🏠", title: "Rumah Bibit", desc: "Manajemen stok bibit per rumah pembibitan" },
    { icon: "📦", title: "Riwayat Distribusi", desc: "Tracking distribusi bibit ke lokasi penanaman" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Hero Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
              <span className="text-4xl">🌿</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Berbumi</h1>
            <p className="text-green-100 text-lg font-medium">Platform Monitoring Reforestasi DAS Bodri</p>
          </div>

          <div className="p-8">
            <p className="text-gray-600 leading-relaxed text-center mb-8">
              Berbumi adalah platform digital yang dikembangkan untuk mendukung transparansi, kolaborasi, dan dampak lingkungan jangka panjang dalam program reforestasi DAS Bodri. Dengan teknologi modern, kami memudahkan monitoring dan pengelolaan data pohon secara real-time.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((f, i) => (
                <div key={i} className="bg-gradient-to-br from-gray-50 to-green-50/30 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <h3 className="font-black text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Tech Stack */}
            <div className="bg-gradient-to-br from-slate-900 to-green-950 rounded-2xl p-6 text-white">
              <p className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-3">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {["React", "Vite", "Tailwind CSS", "Firebase Firestore", "PWA"].map((tech) => (
                  <span key={tech} className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-xl text-xs font-bold border border-white/20">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Dikembangkan oleh</p>
          <a
            href="https://www.instagram.com/bayuutomo1618"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:border-green-300 hover:shadow-lg hover:shadow-green-100 transition-all duration-300 hover:-translate-y-1 group"
          >
            <span className="text-sm font-bold uppercase tracking-tight text-gray-400 group-hover:text-green-600 transition-colors">
              Developer
            </span>
            <span className="text-lg font-black bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              bayuutomo1618
            </span>
          </a>
          <p className="text-xs text-gray-400 italic mt-6">Built with ❤️ for a greener future</p>
          <p className="text-[10px] text-gray-300 uppercase font-bold tracking-widest mt-2">Forum DAS Bodri</p>
        </div>
      </div>
    </div>
  );
}

export default About;
