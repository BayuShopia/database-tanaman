import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
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

  /* =========================
     ROLE MANAGEMENT
  ========================== */
  const isAdmin = user?.role === "admin";
  const isPetugasBibit = user?.role === "petugas_bibit";

  const bolehKelolaStok = isAdmin || isPetugasBibit;
  const bolehHapus = isAdmin;

  /* =========================
     LOAD DATA
  ========================== */
  const load = async () => {
    const q = query(
      collection(db, "stok_bibit"),
      where("rumahBibitId", "==", rumah)
    );
    const snap = await getDocs(q);
    setStok(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    load();
  }, [rumah]);

  /* =========================
     TOTAL CALCULATION (AMAN)
  ========================== */
  const totalJenis = stok.length;

  const totalBibit = stok.reduce((sum, s) => {
    const jumlah = Number(s.jumlah);
    return sum + (isNaN(jumlah) ? 0 : jumlah);
  }, 0);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-black text-green-700 mb-4">
        🏠 Rumah Pembibitan
      </h1>

      {/* HEADER ACTION */}
      <div className="flex justify-between items-center mb-4">
        <select
          value={rumah}
          onChange={(e) => setRumah(e.target.value)}
          className="border rounded-lg p-2"
        >
          <option value="HE">Rumah Bibit HE</option>
          <option value="FB">Rumah Bibit FB</option>
        </select>

        {bolehKelolaStok && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold transition"
            onClick={() => {
              setEditData(null);
              setOpenForm(true);
            }}
          >
            + Tambah Stok
          </button>
        )}
      </div>

      {/* TABLE */}
      <table className="w-full bg-white rounded-xl shadow overflow-hidden">
        <thead className="bg-green-700 text-white text-sm">
          <tr>
            <th className="p-3 text-left">Bibit</th>
            <th className="p-3 text-left">Nama Latin</th>
            <th className="p-3 text-right">Jumlah</th>
            <th className="p-3 text-center hidden sm:table-cell">Kondisi</th>

            {bolehKelolaStok && (
              <th className="p-3 text-center">Aksi</th>
            )}
          </tr>
        </thead>

        <tbody>
          {stok.map((s) => (
            <tr
              key={s.id}
              className="border-t hover:bg-green-50 transition"
            >
              <td className="p-3 font-semibold">{s.namaBibit}</td>
              <td className="p-3 italic text-gray-500">{s.namaLatin}</td>
              <td className="p-3 text-right font-mono">{s.jumlah}</td>
              <td className="p-3 text-center text-gray-500 hidden sm:table-cell">{s.kondisi}</td>

              {bolehKelolaStok && (
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-2">
                    {/* EDIT */}
                    <button
                      className="px-1 py-1 text-xs rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                      title="Edit stok"
                      onClick={() => {
                        setEditData(s);
                        setOpenForm(true);
                      }}
                    >
                      ✏️
                    </button>

                    {/* HAPUS (ADMIN ONLY) */}
                    {bolehHapus && (
                      <button
                        className="px-1 py-1 text-xs rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition"
                        title="Hapus stok"
                        onClick={async () => {
                          const ok = confirm(
                            `Yakin ingin menghapus stok bibit "${s.namaBibit}"?`
                          );
                          if (!ok) return;

                          await deleteDoc(
                            doc(db, "stok_bibit", s.id)
                          );
                          load();
                        }}
                      >
                        🗑️
                      </button>
                    )}
                    {bolehKelolaStok && (
                    <button
  className="px-1 py-1 text-xs rounded-md bg-orange-50 text-orange-700 hover:bg-orange-100 transition"
  title="Bibit keluar"
  onClick={() => {
    setStokKeluar(s);
    setOpenKeluar(true);
  }}
>
  📤
</button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}

          {stok.length === 0 && (
            <tr>
              <td
                colSpan={bolehKelolaStok ? 5 : 4}
                className="p-6 text-center text-gray-400 italic"
              >
                Belum ada data stok bibit.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* TOTAL */}
      <div className="flex justify-end gap-6 mt-4 text-sm font-bold">
        <span>Total jenis: {totalJenis}</span>
        <span>Total bibit: {totalBibit}</span>
      </div>

      {/* FORM MODAL */}
      <FormStokBibit
        open={openForm}
        rumahBibitId={rumah}
        dataEdit={editData}
        onClose={(reload) => {
          setOpenForm(false);
          if (reload) load();
        }}
      />

      <FormBibitKeluar
  open={openKeluar}
  stok={stokKeluar}
  onClose={(reload) => {
    setOpenKeluar(false);
    if (reload) load();
  }}
/>

    </div>
  );
}

export default RumahBibit;