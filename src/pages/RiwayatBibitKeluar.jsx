import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";

function RiwayatBibitKeluar() {
  const [rumah, setRumah] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    let q = query(collection(db, "bibit_keluar"), orderBy("tanggal", "desc"));
    const conditions = [];
    if (rumah !== "ALL") conditions.push(where("rumahBibitId", "==", rumah));
    if (fromDate) conditions.push(where("tanggal", ">=", Timestamp.fromDate(new Date(fromDate))));
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(where("tanggal", "<=", Timestamp.fromDate(end)));
    }
    if (conditions.length > 0) {
      q = query(collection(db, "bibit_keluar"), ...conditions, orderBy("tanggal", "desc"));
    }
    const snap = await getDocs(q);
    setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const totalKeluar = data.reduce((sum, d) => sum + Number(d.jumlahKeluar || 0), 0);

  const formatTanggal = (ts) => {
    if (!ts?.toDate) return "-";
    return ts.toDate().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  const exportCSV = () => {
    if (data.length === 0) return alert("Tidak ada data untuk diexport");
    const header = ["Tanggal","Rumah Bibit","Nama Bibit","Jumlah Keluar","Tujuan","Petugas"];
    const rows = data.map((d) => [d.tanggal?.toDate().toLocaleDateString("id-ID"),d.rumahBibitId,d.namaBibit,d.jumlahKeluar,d.tujuan,d.petugas]);
    const csv = [header,...rows].map(e=>e.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `riwayat_bibit_keluar_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const rumahBadge = { HE: "bg-blue-100 text-blue-700", FB: "bg-purple-100 text-purple-700" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            📦 <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Riwayat Bibit Keluar</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Histori distribusi bibit dari rumah pembibitan</p>
        </div>

        {/* FILTER CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Filter Data</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 block">Rumah Bibit</label>
              <select
                value={rumah}
                onChange={(e) => setRumah(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 px-3 py-2.5 rounded-xl outline-none text-sm font-medium"
              >
                <option value="ALL">Semua Rumah Bibit</option>
                <option value="HE">Rumah Bibit HE</option>
                <option value="FB">Rumah Bibit FB</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 block">Dari Tanggal</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 px-3 py-2.5 rounded-xl outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 block">Sampai Tanggal</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 px-3 py-2.5 rounded-xl outline-none text-sm"
              />
            </div>
            <div className="flex flex-col gap-2 justify-end">
              <button
                onClick={load}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm shadow-green-500/20"
              >
                🔍 Terapkan Filter
              </button>
              <button
                onClick={exportCSV}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
              >
                ⬇️ Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Transaksi</p>
            <p className="text-3xl font-black text-gray-900">{data.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-4 shadow-lg shadow-green-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-200 mb-1">Total Bibit Keluar</p>
            <p className="text-3xl font-black text-white">{totalKeluar.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Tanggal</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Rumah</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Bibit</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider">Jumlah</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider hidden md:table-cell">Tujuan</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider hidden md:table-cell">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((d) => (
                  <tr key={d.id} className="hover:bg-green-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-600 font-medium whitespace-nowrap">{formatTanggal(d.tanggal)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${rumahBadge[d.rumahBibitId] || "bg-gray-100 text-gray-600"}`}>
                        {d.rumahBibitId}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900 text-sm">{d.namaBibit}</td>
                    <td className="px-5 py-4 text-right font-black text-gray-900 font-mono">{d.jumlahKeluar}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden md:table-cell">{d.tujuan}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden md:table-cell">{d.petugas}</td>
                  </tr>
                ))}
                {!loading && data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="text-4xl mb-3">📦</div>
                      <p className="text-gray-400 font-medium text-sm">Tidak ada data riwayat.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {loading && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Memuat data...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RiwayatBibitKeluar;
