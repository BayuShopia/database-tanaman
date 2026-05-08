import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import FormStokBibit from "../components/FormStokBibit";
import FormBibitKeluar from "../components/FormBibitKeluar";

function RumahBibit() {
  const { user } = useAuth();
  const [rumah, setRumah] = useState("HE");
  const [stok, setStok] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [openKeluar, setOpenKeluar] = useState(false);
  const [stokKeluar, setStokKeluar] = useState(null);

  const isAdmin = user?.role === "admin";
  const isPetugasBibit = user?.role === "petugas_bibit";
  const bolehKelolaStok = isAdmin || isPetugasBibit;
  const bolehHapus = isAdmin;

  const load = async () => {
    const q = query(collection(db, "stok_bibit"), where("rumahBibitId", "==", rumah));
    const snap = await getDocs(q);
    setStok(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { load(); }, [rumah]);

  const totalJenis = stok.length;
  const totalBibit = stok.reduce((sum, s) => {
    const jumlah = Number(s.jumlah);
    return sum + (isNaN(jumlah) ? 0 : jumlah);
  }, 0);

  const kondisiColor = {
    Sehat: "bg-emerald-100 text-emerald-700",
    "Perlu Perhatian": "bg-amber-100 text-amber-700",
    Rusak: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            🏠 <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Rumah Pembibitan</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Manajemen stok bibit per rumah pembibitan</p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div className="flex gap-2">
            {["HE", "FB"].map((r) => (
              <button
                key={r}
                onClick={() => setRumah(r)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  rumah === r
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20"
                    : "bg-white border-2 border-gray-200 text-gray-600 hover:border-green-400"
                }`}
              >
                Rumah Bibit {r}
              </button>
            ))}
          </div>
          {bolehKelolaStok && (
            <button
              onClick={() => { setEditData(null); setOpenForm(true); }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-green-500/20 transition-all active:scale-95 text-sm"
            >
              + Tambah Stok
            </button>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Jenis</p>
            <p className="text-3xl font-black text-gray-900">{totalJenis}</p>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-4 shadow-lg shadow-green-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-200 mb-1">Total Bibit</p>
            <p className="text-3xl font-black text-white">{totalBibit.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Bibit</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider">Jumlah</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Kondisi</th>
                  {bolehKelolaStok && <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stok.map((s) => (
                  <tr key={s.id} className="hover:bg-green-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900">{s.namaBibit}</div>
                      <div className="text-xs text-gray-400 italic mt-0.5">{s.namaLatin}</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-black text-gray-900 font-mono">{Number(s.jumlah).toLocaleString('id-ID')}</span>
                      <span className="text-xs text-gray-400 ml-1">{s.satuan}</span>
                    </td>
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${kondisiColor[s.kondisi] || "bg-gray-100 text-gray-600"}`}>
                        {s.kondisi}
                      </span>
                    </td>
                    {bolehKelolaStok && (
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-1.5">
                          <button
                            title="Edit stok"
                            onClick={() => { setEditData(s); setOpenForm(true); }}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all text-sm"
                          >✏️</button>
                          {bolehHapus && (
                            <button
                              title="Hapus stok"
                              onClick={async () => {
                                if (!confirm(`Yakin ingin menghapus stok bibit "${s.namaBibit}"?`)) return;
                                await deleteDoc(doc(db, "stok_bibit", s.id));
                                load();
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all text-sm"
                            >🗑️</button>
                          )}
                          <button
                            title="Bibit keluar"
                            onClick={() => { setStokKeluar(s); setOpenKeluar(true); }}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all text-sm"
                          >📤</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {stok.length === 0 && (
                  <tr>
                    <td colSpan={bolehKelolaStok ? 4 : 3} className="px-5 py-16 text-center">
                      <div className="text-4xl mb-3">🌱</div>
                      <p className="text-gray-400 font-medium text-sm">Belum ada data stok bibit.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <FormStokBibit
          open={openForm}
          rumahBibitId={rumah}
          dataEdit={editData}
          onClose={(reload) => { setOpenForm(false); if (reload) load(); }}
        />
        <FormBibitKeluar
          open={openKeluar}
          stok={stokKeluar}
          onClose={(reload) => { setOpenKeluar(false); if (reload) load(); }}
        />
      </div>
    </div>
  );
}

export default RumahBibit;
