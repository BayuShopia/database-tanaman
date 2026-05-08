import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { addDoc, updateDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

function FormStokBibit({ open, onClose, rumahBibitId, dataEdit }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    namaBibit: "", namaLatin: "", jumlah: "", satuan: "polybag", kondisi: "Sehat", keterangan: ""
  });

  useEffect(() => {
    if (dataEdit) {
      setForm({
        namaBibit: dataEdit.namaBibit, namaLatin: dataEdit.namaLatin,
        jumlah: dataEdit.jumlah, satuan: dataEdit.satuan,
        kondisi: dataEdit.kondisi, keterangan: dataEdit.keterangan || ""
      });
    }
  }, [dataEdit]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.namaBibit || !form.jumlah) return alert("Nama bibit dan jumlah wajib diisi");
    try {
      if (dataEdit) {
        await updateDoc(doc(db, "stok_bibit", dataEdit.id), {
          ...form, jumlah: Number(form.jumlah), updatedAt: serverTimestamp(), updatedBy: user.nama
        });
      } else {
        await addDoc(collection(db, "stok_bibit"), {
          ...form, jumlah: Number(form.jumlah), rumahBibitId, updatedAt: serverTimestamp(), updatedBy: user.nama
        });
      }
      onClose(true);
    } catch (err) { alert(err.message); }
  };

  const inputCls = "w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white px-4 py-3 rounded-2xl outline-none transition-all text-sm font-medium";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 flex justify-between items-center">
          <h2 className="text-lg font-black text-white">
            {dataEdit ? "✏️ Edit Stok Bibit" : "🌱 Tambah Stok Bibit"}
          </h2>
          <button onClick={() => onClose(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Nama Bibit</label>
            <input className={inputCls} placeholder="Nama Bibit" value={form.namaBibit} onChange={(e) => setForm({ ...form, namaBibit: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Nama Latin</label>
            <input className={inputCls} placeholder="Nama Latin (opsional)" value={form.namaLatin} onChange={(e) => setForm({ ...form, namaLatin: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Jumlah</label>
              <input type="number" className={inputCls} placeholder="0" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Satuan</label>
              <select className={inputCls} value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })}>
                <option value="polybag">Polybag</option>
                <option value="tray">Tray</option>
                <option value="batang">Batang</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Kondisi</label>
            <select className={inputCls} value={form.kondisi} onChange={(e) => setForm({ ...form, kondisi: e.target.value })}>
              <option value="Sehat">✅ Sehat</option>
              <option value="Perlu Perhatian">⚠️ Perlu Perhatian</option>
              <option value="Rusak">❌ Rusak</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Keterangan</label>
            <textarea className={`${inputCls} h-20 resize-none`} placeholder="Keterangan tambahan (opsional)" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => onClose(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all text-sm">Batal</button>
            <button type="submit" className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold shadow-lg shadow-green-500/20 transition-all active:scale-95 text-sm">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormStokBibit;
