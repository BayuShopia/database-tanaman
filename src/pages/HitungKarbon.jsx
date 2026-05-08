import { useState, useEffect, useMemo, useRef } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";

function KalkulatorKarbonPro() {
  const [dataPohon, setDataPohon] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTree, setSelectedTree] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [density, setDensity] = useState(0.5);
  const [rawKeliling, setRawKeliling] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    Papa.parse("/data_pohon.csv", {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => { setDataPohon(results.data); setLoading(false); },
    });
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasilAnalisis = useMemo(() => {
    const baris = rawKeliling.split(/[\n,;]+/).filter(val => val.trim() !== "");
    return baris.map((k, index) => {
      const keliling = parseFloat(k.replace(",", "."));
      if (isNaN(keliling) || keliling <= 0) return null;
      const diameter = keliling / Math.PI;
      const biomassa = 0.11 * parseFloat(density) * Math.pow(diameter, 2.62);
      const co2 = biomassa * 0.47 * 3.67;
      return { id: index + 1, keliling: keliling.toFixed(2), diameter: diameter.toFixed(2), co2: co2.toFixed(2) };
    }).filter(item => item !== null);
  }, [rawKeliling, density]);

  const totalCO2 = hasilAnalisis.reduce((sum, item) => sum + parseFloat(item.co2), 0).toFixed(2);

  const exportToCSV = () => {
    if (hasilAnalisis.length === 0) return alert("Tidak ada data untuk diekspor");
    const csvData = hasilAnalisis.map(item => ({
      No: item.id, "Keliling (cm)": item.keliling, "Diameter (cm)": item.diameter,
      "Serapan CO2 (kg)": item.co2, Spesies: selectedTree || "Custom",
      Region: selectedRegion || "N/A", Density: density
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Laporan_Karbon_${new Date().toLocaleDateString()}.csv`);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🌳</div>
        <p className="font-bold text-green-700">Menyiapkan Database Spesies...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              🌳 <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Hitung Karbon</span>
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Sistem Inventarisasi Serapan Karbon Digital</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-green-500/20 transition-all active:scale-95"
          >
            📥 Unduh Laporan CSV
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* KOLOM KIRI */}
          <div className="lg:col-span-5 space-y-5">

            {/* Spesies & Density */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm" ref={dropdownRef}>
              <label className="block text-[10px] font-black text-green-700 uppercase tracking-widest mb-4">1. Parameter Spesies</label>
              <div className="relative mb-5">
                <input
                  type="text"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white px-4 py-3 rounded-2xl outline-none transition-all text-sm"
                  placeholder="Cari Nama Pohon (Binomial)..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                />
                {showDropdown && search && (
                  <ul className="absolute z-30 w-full bg-white border border-gray-100 shadow-2xl rounded-2xl mt-2 max-h-64 overflow-y-auto p-2 custom-scrollbar">
                    {dataPohon
                      .filter(t => t.Binomial?.toLowerCase().includes(search.toLowerCase()))
                      .slice(0, 15)
                      .map((t, i) => (
                        <li key={i}
                          className="p-3 hover:bg-green-50 cursor-pointer rounded-xl flex flex-col border-b border-gray-50 last:border-0 transition-colors"
                          onClick={() => {
                            setDensity(t["Wood density (g/cm^3), oven dry mass/fresh volume"]);
                            setSearch(t.Binomial); setSelectedTree(t.Binomial);
                            setSelectedRegion(t.Region); setShowDropdown(false);
                          }}>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-800 text-sm">{t.Binomial}</span>
                            <span className="text-xs font-mono font-black text-green-600">{t["Wood density (g/cm^3), oven dry mass/fresh volume"]}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold mt-0.5">📍 {t.Region || "Unknown Region"}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-green-800/50 uppercase tracking-widest">Wilayah Data</span>
                    <p className="text-sm font-bold text-green-900 mt-0.5">{selectedRegion || "Pilih spesies..."}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-green-800/50 uppercase tracking-widest block">Density (g/cm³)</span>
                    <input
                      type="number" step="0.01"
                      className="bg-transparent text-2xl font-black text-green-900 text-right w-24 outline-none mt-0.5"
                      value={density}
                      onChange={(e) => { setDensity(e.target.value); setSelectedRegion("Input Manual"); }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Keliling Input */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <label className="block text-[10px] font-black text-blue-700 uppercase tracking-widest mb-4">2. Input Keliling (cm)</label>
              <textarea
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white px-4 py-3 rounded-2xl h-72 outline-none transition-all font-mono text-sm resize-none custom-scrollbar"
                placeholder={"Masukkan keliling pohon...\nSatu nilai per baris\n\nContoh:\n120\n85\n200"}
                value={rawKeliling}
                onChange={(e) => setRawKeliling(e.target.value)}
              />
            </div>
          </div>

          {/* KOLOM KANAN */}
          <div className="lg:col-span-7 space-y-5">

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Sampel</p>
                <p className="text-4xl font-black text-gray-900">{hasilAnalisis.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-6 rounded-3xl shadow-lg shadow-green-500/20 text-white">
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2">Estimasi CO₂ Diserap</p>
                <p className="text-4xl font-black">{totalCO2} <span className="text-sm font-medium opacity-60">kg</span></p>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">No</th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Keliling</th>
                      <th className="px-5 py-3.5 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">CO₂ (kg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {hasilAnalisis.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-12 text-center">
                          <div className="text-3xl mb-2">🌿</div>
                          <p className="text-gray-400 text-sm">Masukkan data keliling pohon untuk melihat hasil</p>
                        </td>
                      </tr>
                    ) : hasilAnalisis.slice(0, 100).map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-gray-400">{item.id}</td>
                        <td className="px-5 py-3 font-bold text-gray-700 text-sm">{item.keliling} cm</td>
                        <td className="px-5 py-3 text-right font-black text-green-700">{item.co2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Metodologi */}
            <div className="bg-white rounded-3xl border-2 border-green-100 p-6 shadow-sm">
              <h3 className="text-sm font-black text-green-800 uppercase tracking-widest mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center text-xs">ℹ️</span>
                Informasi Metodologi & Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Sumber Data Wood Density</h4>
                    <p className="text-xs leading-relaxed text-gray-600 italic">Global Wood Density Database (Zanne et al. 2009). Data mencakup nilai berat jenis kayu kering oven per volume basah (g/cm³).</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Konversi Dimensi</h4>
                    <p className="text-xs leading-relaxed text-gray-600">Diameter (D) dihitung dari Keliling (K) pohon setinggi dada (1.3 m):</p>
                    <code className="inline-block mt-1 bg-gray-100 px-2.5 py-1 rounded-lg font-bold text-blue-700 text-xs">D = K / π</code>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Rumus Allometric (Chave, 2005)</h4>
                    <p className="text-xs leading-relaxed text-gray-600">Estimasi biomassa atas permukaan (AGB):</p>
                    <code className="inline-block mt-1 bg-green-50 px-2.5 py-1 rounded-lg font-bold text-green-700 text-xs">AGB = 0,11 × ρ × D^2,62</code>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Faktor Serapan CO₂</h4>
                    <p className="text-xs leading-relaxed text-gray-600">1. Massa Karbon (C) = AGB × 0,47<br/>2. Serapan CO₂ = C × 3,67 (Rasio 44/12)</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dikembangkan untuk mendukung komunitas lingkungan menghitung serapan karbon.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KalkulatorKarbonPro;
