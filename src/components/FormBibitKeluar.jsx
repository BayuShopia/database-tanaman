import { useState } from "react";
import { db } from "../firebaseConfig";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

function FormBibitKeluar({ open, onClose, stok }) {
  const { user } = useAuth();

  const [jumlah, setJumlah] = useState("");
  const [tujuan, setTujuan] = useState("");

  if (!open || !stok) return null;

  const submit = async (e) => {
    e.preventDefault();

    const qty = Number(jumlah);

    if (isNaN(qty) || qty <= 0) {
      return alert("Jumlah keluar tidak valid");
    }

    if (qty > stok.jumlah) {
      return alert("Jumlah melebihi stok tersedia");
    }

    try {
      // 1️⃣ Kurangi stok
      await updateDoc(doc(db, "stok_bibit", stok.id), {
        jumlah: stok.jumlah - qty,
        updatedAt: serverTimestamp(),
        updatedBy: user.nama,
      });

      // 2️⃣ Catat riwayat keluar
      await addDoc(collection(db, "bibit_keluar"), {
        stokBibitId: stok.id,
        rumahBibitId: stok.rumahBibitId,
        namaBibit: stok.namaBibit,
        jumlahKeluar: qty,
        tujuan: tujuan || "-",
        tanggal: serverTimestamp(),
        petugas: user.nama,
      });

      onClose(true);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl w-full max-w-md"
      >
        <div className="p-5 border-b font-bold text-green-700">
          🌱 Bibit Keluar – {stok.namaBibit}
        </div>

        <div className="p-5 space-y-4">
          <div className="text-sm text-gray-500">
            Stok tersedia:{" "}
            <span className="font-bold">{stok.jumlah}</span>
          </div>

          <input
            type="number"
            className="w-full border p-2 rounded"
            placeholder="Jumlah keluar"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Tujuan (mis. Penanaman DAS Bodri)"
            value={tujuan}
            onChange={(e) => setTujuan(e.target.value)}
          />
        </div>

        <div className="p-5 border-t flex gap-2">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="flex-1 border py-2 rounded"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold"
          >
            Keluarkan
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormBibitKeluar;