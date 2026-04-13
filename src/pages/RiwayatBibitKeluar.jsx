import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";

function RiwayatBibitKeluar() {
  const [rumah, setRumah] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);

    let q = query(
      collection(db, "bibit_keluar"),
      orderBy("tanggal", "desc")
    );

    const conditions = [];

    if (rumah !== "ALL") {
      conditions.push(where("rumahBibitId", "==", rumah));
    }

    if (fromDate) {
      conditions.push(
        where("tanggal", ">=", Timestamp.fromDate(new Date(fromDate)))
      );
    }

    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(
        where("tanggal", "<=", Timestamp.fromDate(end))
      );
    }

    if (conditions.length > 0) {
      q = query(
        collection(db, "bibit_keluar"),
        ...conditions,
        orderBy("tanggal", "desc")
      );
    }

    const snap = await getDocs(q);
    setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const totalKeluar = data.reduce(
    (sum, d) => sum + Number(d.jumlahKeluar || 0),
    0
  );

  const formatTanggal = (ts) => {
    if (!ts?.toDate) return "-";
    return ts
      .toDate()
      .toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  };

  const exportCSV = () => {
  if (data.length === 0) {
    alert("Tidak ada data untuk diexport");
    return;
  }

  const header = [
    "Tanggal",
    "Rumah Bibit",
    "Nama Bibit",
    "Jumlah Keluar",
    "Tujuan",
    "Petugas"
  ];

  const rows = data.map((d) => [
    d.tanggal?.toDate().toLocaleDateString("id-ID"),
    d.rumahBibitId,
    d.namaBibit,
    d.jumlahKeluar,
    d.tujuan,
    d.petugas
  ]);

  const csvContent =
    [header, ...rows]
      .map((e) =>
        e.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `riwayat_bibit_keluar_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-black text-green-700 mb-6">
        📦 Riwayat Bibit Keluar
      </h1>

      {/* FILTER */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={rumah}
          onChange={(e) => setRumah(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="ALL">Semua Rumah Bibit</option>
          <option value="HE">Rumah Bibit HE</option>
          <option value="FB">Rumah Bibit FB</option>
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={load}
          className="bg-green-600 hover:bg-green-700 text-white rounded font-bold"
        >
          Terapkan Filter
        </button>

         <button
    onClick={exportCSV}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
  >
    ⬇️ Export CSV
  </button>
      </div>
<div className="flex justify-end gap-2 mb-4">
 
</div>
      {/* TABLE */}
     
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-[640px] w-full bg-white rounded-xl shadow overflow-hidden">
          <thead className="bg-green-700 text-white">
            <tr>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-left">Rumah Bibit</th>
              <th className="p-3 text-left">Bibit</th>
              <th className="p-3 text-right">Jumlah</th>
              <th className="p-3 text-left">Tujuan</th>
              <th className="p-3 text-left">Petugas</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.id} className="border-t hover:bg-green-50">
                <td className="p-3">{formatTanggal(d.tanggal)}</td>
                <td className="p-3 font-bold">{d.rumahBibitId}</td>
                <td className="p-3">{d.namaBibit}</td>
                <td className="p-3 text-right font-mono">
                  {d.jumlahKeluar}
                </td>
                <td className="p-3">{d.tujuan}</td>
                <td className="p-3">{d.petugas}</td>
              </tr>
            ))}

            {!loading && data.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-400 italic"
                >
                  Tidak ada data riwayat.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {loading && (
          <div className="p-6 text-center text-gray-400">
            Memuat data…
          </div>
        )}
      </div>

      {/* TOTAL */}
      <div className="flex justify-end mt-4 font-bold">
        Total bibit keluar: {totalKeluar}
      </div>

    </div>
  );
}

export default RiwayatBibitKeluar;