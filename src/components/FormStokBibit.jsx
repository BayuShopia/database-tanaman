import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { addDoc, updateDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

function FormStokBibit({ open, onClose, rumahBibitId, dataEdit }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    namaBibit: "",
    namaLatin: "",
    jumlah: "",
    satuan: "polybag",
    kondisi: "Sehat",
    keterangan: ""
  });

  useEffect(() => {
    if (dataEdit) {
      setForm({
        namaBibit: dataEdit.namaBibit,
        namaLatin: dataEdit.namaLatin,
        jumlah: dataEdit.jumlah,
        satuan: dataEdit.satuan,
        kondisi: dataEdit.kondisi,
        keterangan: dataEdit.keterangan || ""
      });
    }
  }, [dataEdit]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.namaBibit || !form.jumlah) {
      return alert("Nama bibit dan jumlah wajib diisi");
    }

    try {
      if (dataEdit) {
        // UPDATE
        await updateDoc(doc(db, "stok_bibit", dataEdit.id), {
          ...form,
          jumlah: Number(form.jumlah),
          updatedAt: serverTimestamp(),
          updatedBy: user.nama
        });
      } else {
        // CREATE
        await addDoc(collection(db, "stok_bibit"), {
          ...form,
          jumlah: Number(form.jumlah),
          rumahBibitId,
          updatedAt: serverTimestamp(),
          updatedBy: user.nama
        });
      }

      onClose(true);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-5 border-b font-bold text-green-700">
          {dataEdit ? "Edit Stok Bibit" : "Tambah Stok Bibit"}
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input
            className="w-full border p-2 rounded"
            placeholder="Nama Bibit"
            value={form.namaBibit}
            onChange={(e) => setForm({ ...form, namaBibit: e.target.value })}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Nama Latin"
            value={form.namaLatin}
            onChange={(e) => setForm({ ...form, namaLatin: e.target.value })}
          />

          <input
            type="number"
            className="w-full border p-2 rounded"
            placeholder="Jumlah"
            value={form.jumlah}
            onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
          />

          <select
            className="w-full border p-2 rounded"
            value={form.satuan}
            onChange={(e) => setForm({ ...form, satuan: e.target.value })}
          >
            <option value="polybag">Polybag</option>
            <option value="tray">Tray</option>
            <option value="batang">Batang</option>
          </select>

          <select
            className="w-full border p-2 rounded"
            value={form.kondisi}
            onChange={(e) => setForm({ ...form, kondisi: e.target.value })}
          >
            <option value="Sehat">Sehat</option>
            <option value="Perlu Perhatian">Perlu Perhatian</option>
            <option value="Rusak">Rusak</option>
          </select>

          <textarea
            className="w-full border p-2 rounded"
            placeholder="Keterangan (opsional)"
            value={form.keterangan}
            onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
          />

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 py-2 rounded border"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded bg-green-600 text-white font-bold"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormStokBibit;
``