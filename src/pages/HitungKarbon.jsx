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
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setDataPohon(results.data);
        setLoading(false);
      },
    });

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
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
      // Rumus Alometrik: 0.11 * Wood Density * (Diameter ^ 2.62)
      const biomassa = 0.11 * parseFloat(density) * Math.pow(diameter, 2.62);
      // Konversi: Biomassa -> Karbon (47%) -> CO2 (x 3.67)
      const co2 = biomassa * 0.47 * 3.67;

      return {
        id: index + 1,
        keliling: keliling.toFixed(2),
        diameter: diameter.toFixed(2),
        co2: co2.toFixed(2)
      };
    }).filter(item => item !== null);
  }, [rawKeliling, density]);

  const totalCO2 = hasilAnalisis.reduce((sum, item) => sum + parseFloat(item.co2), 0).toFixed(2);

  const exportToCSV = () => {
    if (hasilAnalisis.length === 0) return alert("Tidak ada data untuk diekspor");
    const csvData = hasilAnalisis.map(item => ({
      No: item.id,
      "Keliling (cm)": item.keliling,
      "Diameter (cm)": item.diameter,
      "Serapan CO2 (kg)": item.co2,
      Spesies: selectedTree || "Custom",
      Region: selectedRegion || "N/A",
      Density: density
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Laporan_Karbon_${new Date().toLocaleDateString()}.csv`);
  };

  if (loading) return <div className="p-20 text-center font-bold text-green-700">Menyiapkan Database Spesies...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <span className="text-3xl">🌳</span> Hitung Karbon
          </h1>
          <p className="text-sm text-gray-500 font-medium italic">Sistem Inventarisasi Serapan Karbon Digital</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-100"
        >
          📥 Unduh Laporan CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* KOLOM KIRI: INPUT */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Spesies & Density */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm" ref={dropdownRef}>
            <label className="block text-xs font-black text-green-700 uppercase tracking-widest mb-4">1. Parameter Spesies</label>
            
            <div className="relative mb-6">
              <input
                type="text"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white p-4 rounded-2xl outline-none transition-all shadow-inner"
                placeholder="Cari Nama Pohon (Binomial)..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
              />
              
              {showDropdown && search && (
                <ul className="absolute z-30 w-full bg-white border border-gray-100 shadow-2xl rounded-2xl mt-2 max-h-64 overflow-y-auto p-2">
                  {dataPohon
                    .filter(t => t.Binomial?.toLowerCase().includes(search.toLowerCase()))
                    .slice(0, 15)
                    .map((t, i) => (
                    <li key={i} className="p-3 hover:bg-green-50 cursor-pointer rounded-xl flex flex-col border-b border-gray-50 last:border-0"
                      onClick={() => { 
                        setDensity(t["Wood density (g/cm^3), oven dry mass/fresh volume"]); 
                        setSearch(t.Binomial);
                        setSelectedTree(t.Binomial);
                        setSelectedRegion(t.Region);
                        setShowDropdown(false); 
                      }}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">{t.Binomial}</span>
                        <span className="text-xs font-mono font-bold text-green-600">{t["Wood density (g/cm^3), oven dry mass/fresh volume"]}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">📍 {t.Region || "Unknown Region"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100 relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black text-green-800/50 uppercase tracking-widest">Wilayah Data</span>
                  <p className="text-sm font-bold text-green-900">{selectedRegion || "Pilih spesies..."}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-green-800/50 uppercase tracking-widest text-right block">Density (g/cm³)</span>
                  <input 
                    type="number" 
                    step="0.01"
                    className="bg-transparent text-2xl font-black text-green-900 text-right w-24 outline-none"
                    value={density}
                    onChange={(e) => { setDensity(e.target.value); setSelectedRegion("Input Manual"); }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Keliling */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <label className="block text-xs font-black text-blue-700 uppercase tracking-widest mb-4">2. Input Keliling (cm)</label>
            <textarea
              className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-4 rounded-2xl h-72 outline-none transition-all shadow-inner font-mono text-sm"
              placeholder="Gunakan baris baru untuk setiap pohon..."
              value={rawKeliling}
              onChange={(e) => setRawKeliling(e.target.value)}
            />
          </div>
        </div>

        {/* KOLOM KANAN: HASIL & METODOLOGI */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Sampel</p>
              <p className="text-4xl font-black text-gray-800">{hasilAnalisis.length}</p>
            </div>
            <div className="bg-green-800 p-6 rounded-3xl shadow-lg shadow-green-100 text-white flex flex-col justify-center">
              <p className="text-[10px] font-black opacity-60 uppercase mb-1">Estimasi CO₂ Diserap</p>
              <p className="text-4xl font-black">{totalCO2} <span className="text-sm font-medium opacity-60 ml-1">kg</span></p>
            </div>
          </div>

          {/* Tabel */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase">No</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Keliling</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase text-right">CO₂ (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {hasilAnalisis.slice(0, 100).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono text-xs text-gray-400">{item.id}</td>
                    <td className="p-4 font-bold text-gray-700">{item.keliling} cm</td>
                    <td className="p-4 text-right font-black text-green-700">{item.co2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PANEL INFORMASI METODOLOGI */}
          <div className="bg-white rounded-3xl border-2 border-green-100 p-8 shadow-sm">
            <h3 className="text-sm font-black text-green-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="bg-green-100 p-1 rounded">ℹ️</span> Informasi Metodologi & Data
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h4 className="text-[11px] font-black text-gray-400 uppercase mb-2">Sumber Data Wood Density</h4>
                  <p className="text-xs leading-relaxed text-gray-600 italic">
                    "Global Wood Density Database" (Zanne et al. 2009). <br/>
                    Data mencakup nilai berat jenis kayu kering oven per volume basah (g/cm³).
                  </p>
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-gray-400 uppercase mb-2">Konversi Dimensi</h4>
                  <p className="text-xs leading-relaxed text-gray-600">
                    Diameter ($D$) dihitung dari Keliling ($K$) lapangan menggunakan rumus: <br/>
                    <code className="bg-gray-100 px-2 py-1 rounded font-bold text-blue-700 text-[13px]">D = K / π</code>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[11px] font-black text-gray-400 uppercase mb-2">Rumus Allometric (Chave, 2005)</h4>
                  <p className="text-xs leading-relaxed text-gray-600">
                    Estimasi biomassa atas permukaan ($AGB$) dihitung tanpa data tinggi pohon: <br/>
                    <code className="bg-green-50 px-2 py-1 rounded font-bold text-green-700 text-[13px]">AGB = 0,11 × ρ × D^2,62</code>
                  </p>
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-gray-400 uppercase mb-2">Faktor Serapan CO₂</h4>
                  <p className="text-xs leading-relaxed text-gray-600">
                    1. Massa Karbon ($C$) = $AGB \times 0,47$ <br/>
                    2. Serapan $CO_2$ = $C \times 3,67$ (Rasio $44/12$)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Aplikasi dikembangkan untuk mendukung komunitas lingkungan menghitung serapan karbon.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default KalkulatorKarbonPro;