import { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

function FormBibitKeluar({ open, onClose, stok }) {
  const { user } = useAuth();
  const [jumlah, setJumlah] = useState("");
  const [tujuan, setTujuan] = useState("");

  if (!open || !stok) return null;

  const submit = async (e) => {
    e.preventDefault();
    const qty = Number(jumlah);
    if (isNaN(qty) || qty <= 0) return alert("Jumlah keluar tidak valid");
    if (qty > stok.jumlah) return alert("Jumlah melebihi stok tersedia");
    try {
      await updateDoc(doc(db, "stok_bibit", stok.id), {
        jumlah: stok.jumlah - qty, updatedAt: serverTimestamp(), updatedBy: user.nama,
      });
      await addDoc(collection(db, "bibit_keluar"), {
        stokBibitId: stok.id, rumahBibitId: stok.rumahBibitId, namaBibit: stok.namaBibit,
        jumlahKeluar: qty, tujuan: tujuan || "-", tanggal: serverTimestamp(), petugas: user.nama,
      });
      onClose(true);
    } catch (err) { alert(err.message); }
  };

  const inputCls = "w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white px-4 py-3 rounded-2xl outline-none transition-all text-sm font-medium";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-white">📤 Bibit Keluar</h2>
            <p className="text-orange-100 text-sm font-medium mt-0.5">{stok.namaBibit}</p>
          </div>
          <button type="button" onClick={() => onClose(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Stok Info */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-0.5">Stok Tersedia</p>
              <p className="text-2xl font-black text-orange-700">{stok.jumlah} <span className="text-sm font-medium text-orange-500">{stok.satuan}</span></p>
            </div>
            <span className="text-3xl">🌱</span>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Jumlah Keluar</label>
            <input
              type="number"
              className={inputCls}
              placeholder="Masukkan jumlah"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Tujuan</label>
            <input
              className={inputCls}
              placeholder="Contoh: Penanaman DAS Bodri"
              value={tujuan}
              onChange={(e) => setTujuan(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => onClose(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all text-sm">Batal</button>
            <button type="submit" className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95 text-sm">Keluarkan Bibit</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default FormBibitKeluar;
