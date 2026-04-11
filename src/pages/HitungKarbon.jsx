import { useState } from "react";

function HitungKarbon() {
  const [jumlah, setJumlah] = useState(0);

  const karbon = jumlah * 22; // contoh: 1 pohon = 22kg CO₂/tahun

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-black text-green-700 mb-4">
        🌍 Hitung Serapan Karbon
      </h2>

      <input
        type="number"
        className="w-full border p-3 rounded-lg"
        placeholder="Jumlah pohon"
        value={jumlah}
        onChange={(e) => setJumlah(e.target.value)}
      />

      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <p className="text-lg font-bold text-green-800">
          Estimasi Serapan:
        </p>
        <p className="text-2xl font-black">
          {karbon || 0} kg CO₂ / tahun
        </p>
      </div>
    </div>
  );
}

export default HitungKarbon;