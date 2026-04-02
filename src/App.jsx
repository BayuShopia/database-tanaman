import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import { usePagination } from './context/usePagination';

import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

function App() {
  // 1. SEMUA HOOKS DI ATAS (Sesuai Aturan React)
  const { user, logout } = useAuth();
  
  // Menggunakan Custom Hook Pagination yang baru kita buat
  const { 
    data: daftarTanaman, 
    loading, 
    hasMore, 
    fetchData, 
    setData 
  } = usePagination("tanaman", 10, "tglTanam");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTanaman, setSelectedTanaman] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);
  const [logForm, setLogForm] = useState({ aktivitas: 'Penyiraman', catatan: '' });
  const [form, setForm] = useState({
    acara: '', kode: '', kondisi: 'Hidup', lokasi: '', nama: '', namaLatin: '', sumber: '', koordinat: ''
  });

  // 2. USE EFFECTS
  useEffect(() => {
  if (user) {
    fetchData(false);
  }
}, [user]);

  useEffect(() => {
    if (selectedTanaman) {
      ambilLogPerawatan(selectedTanaman.id);
    } else {
      setLogs([]);
    }
  }, [selectedTanaman]);

  // 3. FUNGSI-FUNGSI LOGIKA (Tetap Sama)
  const ambilLogPerawatan = async (tanamanId) => {
    try {
      const logRef = collection(db, "tanaman", tanamanId, "log_perawatan");
      const querySnapshot = await getDocs(logRef);
      const dataLog = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(dataLog.sort((a, b) => b.tanggal - a.tanggal));
    } catch (e) { console.error("Gagal ambil log:", e); }
  };

  const ubahKondisiTanaman = async (id, kondisiBaru) => {
    try {
      const tanamanRef = doc(db, "tanaman", id);
      await updateDoc(tanamanRef, { kondisi: kondisiBaru });
      
      // Update state lokal via setData dari hook
      setData(prev => prev.map(t => t.id === id ? { ...t, kondisi: kondisiBaru } : t));
      setSelectedTanaman(prev => ({ ...prev, kondisi: kondisiBaru }));
      alert(`Status berhasil diubah menjadi ${kondisiBaru}`);
    } catch (err) { alert("Gagal update status: " + err.message); }
  };

  const simpanTanaman = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "tanaman"), { 
        ...form, 
        tglTanam: serverTimestamp(), // Gunakan serverTimestamp agar lebih akurat
        penanam: user.nama, 
        userId: user.id 
      });
      
      alert("Berhasil disimpan!");
      
      // Optimistic Update: Tambahkan ke list lokal paling atas tanpa reload
      const dataBaru = { id: docRef.id, ...form, tglTanam: { toDate: () => new Date() }, penanam: user.nama };
      setData(prev => [dataBaru, ...prev]);
      
      setForm({ acara: '', kode: '', kondisi: 'Hidup', lokasi: '', nama: '', namaLatin: '', sumber: '', koordinat: '' });
      setIsModalOpen(false);
    } catch (err) { alert(err.message); }
  };

  const simpanLog = async (e) => {
    e.preventDefault();
    if (!logForm.catatan) return alert("Isi catatan dulu!");
    try {
      const logRef = collection(db, "tanaman", selectedTanaman.id, "log_perawatan");
      await addDoc(logRef, {
        ...logForm,
        tanggal: serverTimestamp(),
        petugas: user.nama,
        petugasId: user.id
      });
      setLogForm({ aktivitas: 'Penyiraman', catatan: '' });
      ambilLogPerawatan(selectedTanaman.id);
      alert("Catatan tersimpan!");
    } catch (err) { alert("Error: " + err.message); }
  };

  const ambilGPS = () => {
    if (!navigator.geolocation) return alert("Browser tidak mendukung GPS");
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm({ ...form, koordinat: `${pos.coords.latitude}, ${pos.coords.longitude}` });
      alert("Lokasi dikunci!");
    }, (err) => alert("Gagal: " + err.message), { enableHighAccuracy: true });
  };

  const tanamanFilter = daftarTanaman.filter((t) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      t.nama?.toLowerCase().includes(searchLower) || 
      t.kode?.toLowerCase().includes(searchLower) ||
      t.lokasi?.toLowerCase().includes(searchLower)
    );
  });

  const formatTanggal = (ts) => {
    if (!ts) return "-";
    const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

const hitungUsiaTanaman = (tglTanam) => {
  if (!tglTanam) return "Tanggal tidak tersedia";

  const tglAwal = typeof tglTanam.toDate === 'function'
    ? tglTanam.toDate()
    : new Date(tglTanam);

  const sekarang = new Date();

  let tahun = sekarang.getFullYear() - tglAwal.getFullYear();
  let bulan = sekarang.getMonth() - tglAwal.getMonth();
  let hari = sekarang.getDate() - tglAwal.getDate();

  // Jika hari negatif
  if (hari < 0) {
    bulan -= 1;
    const hariBulanLalu = new Date(sekarang.getFullYear(), sekarang.getMonth(), 0).getDate();
    hari += hariBulanLalu;
  }

  // Jika bulan negatif
  if (bulan < 0) {
    tahun -= 1;
    bulan += 12;
  }

  return `${tahun} Tahun ${bulan} Bulan ${hari} Hari`;
};

  // 4. CONDITIONAL RENDERING (Login Check)
  if (!user) {
    return <Login />;
  }

  // Logika pembatasan akses
const isAdmin = user?.role === 'admin';
const isSurveyor = user?.role === 'surveyor';
const isGuest = user?.role === 'guest';

// Siapa yang boleh menambah/mengedit? (Admin & Surveyor)
const bolehInput = isAdmin || isSurveyor;
  // 5. RETURN DASHBOARD (UI Utama)
 
  return (
   <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
   <button onClick={logout} className="text-[10px] font-bold text-red-500 uppercase mb-2">
        Keluar ({user.nama})
      </button>
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER & SEARCH BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-800">🌿 Berbumi Database</h1>
            <p className="text-gray-500 text-sm">Monitoring Reforestasi Das Bodri</p>
          </div>
          
          <div className="flex w-full md:w-auto gap-2">
            {/* INPUT SEARCH */}
            <div className="relative flex-1 md:w-64">
              <input 
                type="text"
                placeholder="Cari nama, kode, atau lokasi..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-full focus:border-green-500 outline-none transition shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
            {bolehInput && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-bold shadow-lg transition transform hover:scale-105"
            >
              + Tambah
            </button>
            )}
          </div>
        </div>

        {/* DAFTAR TANAMAN (Menggunakan tanamanFilter, bukan daftarTanaman langsung) */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
  <table className="min-w-full leading-normal">
    <thead>
      <tr className="bg-green-700 text-white text-left">
        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Tanaman</th>
        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Lokasi</th>
        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {tanamanFilter.length > 0 ? (
        tanamanFilter.map((t) => (
          <tr 
            key={t.id} 
            className="hover:bg-green-50 transition cursor-pointer"
            onClick={() => setSelectedTanaman(t)}
          >
            <td className="px-5 py-4">
              <div className="font-bold text-gray-800">{t.nama}</div>
              <div className="text-sm text-gray-500 italic">{t.namaLatin || '-'}</div>
              <div className="text-xs text-green-600 mt-1 font-mono">{t.kode}</div>
            </td>
            <td className="px-5 py-4 text-left">
              <div className="text-sm text-gray-800 font-medium">{t.lokasi}</div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">{t.acara || '-'}</div>
            </td>
            <td className="px-5 py-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap inline-flex items-center gap-1
                ${t.kondisi === 'Hidup' 
                  ? 'bg-green-100 text-green-800' 
                  : t.kondisi === 'Atensi' 
                    ? 'bg-yellow-100 text-yellow-900' 
                    : 'bg-red-100 text-red-800'
                }`}>
                {t.kondisi === 'Hidup' ? '🌱 ' : t.kondisi === 'Atensi' ? '⚠️ ' : '🥀 '}
                {t.kondisi}
              </span>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="3" className="px-5 py-10 text-center text-gray-400 italic text-sm">
            {loading ? 'Menyinkronkan data...' : 'Data tidak ditemukan...'}
          </td>
        </tr>
      )}
    </tbody>
  </table>

  {/* BAGIAN PAGINATION: Diletakkan di luar table tapi masih di dalam container putih */}
  {hasMore && (
    <div className="p-4 bg-gray-50 border-t flex justify-center">
      <button 
        onClick={() => fetchData(true)} 
        disabled={loading}
        className={`w-full py-3 rounded-xl font-black text-xs transition-all shadow-sm active:scale-95
          ${loading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white'
          }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-green-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            MEMUAT DATA...
          </span>
        ) : 'TAMPILKAN LEBIH BANYAK'}
      </button>
    </div>
  )}

  {/* Indikator jika data sudah habis */}
  {!hasMore && tanamanFilter.length > 0 && (
    <div className="p-4 bg-gray-50 border-t text-center">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        — Akhir dari data pohon —
      </p>
    </div>
  )}
</div>

        {/* MODAL FORM INPUT */}
          {isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    {/* Tambahkan flex flex-col agar anak-anaknya bisa diatur tingginya */}
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
      
      {/* HEADER: Tetap di atas (shrink-0) */}
      <div className="p-6 border-b flex justify-between items-center bg-green-50 shrink-0">
        <h2 className="text-xl font-bold text-green-900">Input Data Baru</h2>
        <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
      </div>
      
      {/* FORM: Kita bagi menjadi area scroll dan area tombol */}
      <form onSubmit={simpanTanaman} className="flex flex-col overflow-hidden">
        
        {/* AREA INPUT: Bisa di-scroll (overflow-y-auto) */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1 text-left">
              <label className="text-xs font-bold text-gray-400 uppercase">Kode Pohon</label>
              <input className="w-full border-b-2 border-gray-200 focus:border-green-500 outline-none py-2" 
                placeholder="Contoh: FB1001" required value={form.kode} 
                onChange={(e) => setForm({...form, kode: e.target.value})} />
            </div>
            <div className="col-span-2 md:col-span-1 text-left">
              <label className="text-xs font-bold text-gray-400 uppercase">Nama Lokal</label>
              <input className="w-full border-b-2 border-gray-200 focus:border-green-500 outline-none py-2" 
                placeholder="Contoh: Beringin" required value={form.nama} 
                onChange={(e) => setForm({...form, nama: e.target.value})} />
            </div>
          </div>

          <div className="text-left">
            <label className="text-xs font-bold text-gray-400 uppercase">Nama Latin</label>
            <input className="w-full border-b-2 border-gray-200 focus:border-green-500 outline-none py-2" 
              placeholder="Nama Latin" value={form.namaLatin} 
              onChange={(e) => setForm({...form, namaLatin: e.target.value})} />
          </div>

          <div className="text-left">
            <label className="text-xs font-bold text-gray-400 uppercase">Lokasi Penanaman</label>
            <input className="w-full border-b-2 border-gray-200 focus:border-green-500 outline-none py-2" 
              placeholder="Lokasi Penanaman" value={form.lokasi} 
              onChange={(e) => setForm({...form, lokasi: e.target.value})} />
          </div>

          <div className="text-left">
            <label className="text-xs font-bold text-gray-400 uppercase">Sumber Bibit</label>
            <input className="w-full border-b-2 border-gray-200 focus:border-green-500 outline-none py-2" 
              placeholder="Sumber Bibit" value={form.sumber} 
              onChange={(e) => setForm({...form, sumber: e.target.value})} />
          </div>

          <div className="text-left">
            <label className="text-xs font-bold text-gray-400 uppercase">Acara</label>
            <input className="w-full border-b-2 border-gray-200 focus:border-green-500 outline-none py-2" 
              placeholder="Dalam Rangka Acara Apa ?" value={form.acara} 
              onChange={(e) => setForm({...form, acara: e.target.value})} />
          </div>
          
          <div className="text-left">
            <label className="text-xs font-bold text-gray-400 uppercase">Koordinat GPS</label>
            <div className="flex gap-2 items-center">
              <input 
                className="flex-1 border-b-2 border-gray-200 focus:border-green-500 outline-none py-2 font-mono text-sm" 
                placeholder="-7.1234, 110.5678"
                value={form.koordinat}
                onChange={(e) => setForm({...form, koordinat: e.target.value})}
              />
              <button 
                type="button"
                onClick={ambilGPS}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-200 shrink-0"
              >
                📍 Ambil GPS
              </button>
            </div>
          </div>

          <div className="text-left">
            <label className="text-xs font-bold text-gray-400 uppercase">Kondisi</label>
            <select className="w-full border p-2 rounded-lg bg-gray-50 mt-1" value={form.kondisi} 
              onChange={(e) => setForm({...form, kondisi: e.target.value})}>
              <option value="Hidup">🌱 Hidup</option>
              <option value="Atensi">⚠️ Perlu Perhatian</option>
              <option value="Mati">🥀 Mati</option>
            </select>
          </div>
        </div>

        {/* TOMBOL AKSI: Tetap di bawah (shrink-0) */}
        <div className="p-6 bg-gray-50 border-t flex gap-3 shrink-0">
          <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition">Batal</button>
          <button type="submit" className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition">Simpan Data</button>
        </div>
      </form>
    </div>
  </div>
)}

        {/* MODAL DETAIL TANAMAN */}
        {selectedTanaman && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    {/* Penambahan flex-col dan max-h-90vh agar modal tidak melebihi layar */}
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
      
      {/* HEADER: Diberi shrink-0 agar tidak mengecil */}
      <div className="bg-green-700 p-6 text-white flex justify-between items-center shrink-0">
        <div className="text-left">
          <h2 className="text-2xl font-bold">{selectedTanaman.nama}</h2>
          <p className="text-green-200 italic text-sm">{selectedTanaman.namaLatin}</p>
        </div>
        <button onClick={() => setSelectedTanaman(null)} className="text-3xl hover:text-gray-200 transition">×</button>
      </div>

      {/* BODY: Di sinilah kunci perbaikannya (overflow-y-auto dan flex-1) */}
      <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* KOLOM KIRI: Informasi & Update */}
          <div className="space-y-6 text-left">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-[10px] uppercase font-black text-green-600">Didata/Ditanam Oleh</p>
              <p className="text-sm font-bold text-gray-800">
                {selectedTanaman.penanam || "Anggota Forum"}
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-gray-400 uppercase">Informasi Dasar</label>
              <div className="text-sm space-y-1">
                <p className="text-gray-700"><strong>Kode:</strong> {selectedTanaman.kode}</p>
                <p className="text-gray-700"><strong>Sumber:</strong> {selectedTanaman.sumber || '-'}</p>
                <p className="text-gray-700"><strong>Acara:</strong> {selectedTanaman.acara || '-'}</p>
                <p className="text-gray-700"><strong>Tanggal Tanam:</strong> {formatTanggal(selectedTanaman.tglTanam)}</p>
                <p className="text-gray-700"><strong>Usia Pohon:</strong> <span className="ml-1 text-blue-700 font-bold">{hitungUsiaTanaman(selectedTanaman.tglTanam)}</span></p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase">Lokasi Geografis</label>
              <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                <span className="text-xl">📍</span>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-blue-800 font-mono truncate">{selectedTanaman.koordinat || 'Belum diset'}</p>
                </div>
                {selectedTanaman.koordinat && (
                  <a 
                    href={`https://www.google.com/maps?q=${encodeURIComponent(selectedTanaman.koordinat)}`}
                    target="_blank" rel="noreferrer"
                    className="bg-blue-600 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 shrink-0"
                  >
                    Buka Maps
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase">Update Kondisi</label>
          {isAdmin ? (
  <div className="flex gap-2">
    {['Hidup', 'Atensi', 'Mati'].map((status) => (
      <button
        key={status}
        onClick={() => ubahKondisiTanaman(selectedTanaman.id, status)}
        className={`flex-1 py-2 px-1 rounded-lg text-[10px] font-bold transition border ${
          selectedTanaman.kondisi === status 
            ? (status === 'Mati' ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-green-600 border-green-600 text-white shadow-md')
            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
        }`}
      >
        {status === 'Hidup' ? '🌱 Hidup' : status === 'Mati' ? '🥀 Mati' : '⚠️ Perhatian'}
      </button>
    ))}
  </div>
) : (
  // Jika bukan admin, tampilkan status saja tanpa tombol
  <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
     <p className="text-sm font-bold text-gray-700">
       Status Saat Ini: {selectedTanaman.kondisi}
     </p>
  </div>
)}
            </div>
          </div>

          {/* KOLOM KANAN: Riwayat & Input Perawatan */}
          <div className="flex flex-col space-y-4 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-300 h-full min-h-[350px]">
            <label className="block text-xs font-black text-green-700 uppercase shrink-0">Riwayat & Input Perawatan</label>
            
            {/* List Log (Scrollable di dalam area dashboard log) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {logs.length > 0 ? logs.map((log) => (
                <div key={log.id} className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-green-500 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-700 text-xs">{log.aktivitas}</span>
                    <span className="text-[9px] text-gray-400">{formatTanggal(log.tanggal)}</span>
                    
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{log.catatan}</p>
                   
                {/* Menampilkan siapa yang melakukan perawatan */}
                <span className="text-[9px] text-green-600 font-bold uppercase">Oleh: {log.petugas}</span>
                </div>
              )) : (
                <p className="text-xs text-gray-400 italic text-center mt-10">Belum ada catatan perawatan.</p>
              )}
            </div>

            {/* FORM INPUT LOG (Tetap di posisi bawah kolom kanan) */}
            {bolehInput ? (
            <form onSubmit={simpanLog} className="space-y-2 pt-2 border-t border-gray-200 shrink-0">
              <select 
                className="w-full p-2 text-xs border rounded-lg bg-white outline-none"
                value={logForm.aktivitas}
                onChange={(e) => setLogForm({...logForm, aktivitas: e.target.value})}
              >
                <option value="Penyiraman">💧 Penyiraman</option>
                <option value="Pemupukan">🧪 Pemupukan</option>
                <option value="Pemangkasan">✂️ Pemangkasan</option>
                <option value="Monitoring">🔍 Monitoring Rutin</option>
              </select>
              <textarea 
                placeholder="Catatan kondisi..."
                className="w-full p-2 text-xs border rounded-lg h-16 outline-none focus:ring-1 focus:ring-green-500"
                value={logForm.catatan}
                onChange={(e) => setLogForm({...logForm, catatan: e.target.value})}
              />
              <button type="submit" className="w-full bg-green-700 text-white py-2 rounded-xl text-xs font-bold hover:bg-green-800 transition">
                Simpan Update
              </button>
            </form>
            ):(
              <div className="pt-4 text-center border-t border-gray-100">
                <p className="text-[10px] text-gray-400 italic">Login sebagai Surveyor untuk menambah log.</p>
              </div>
            )}
           </div> 
        </div>
      </div>
      
      {/* FOOTER: Fixed di bawah, tombol Tutup akan selalu kelihatan */}
      <div className="p-5 bg-gray-50 border-t flex justify-end shrink-0">
        <button 
          onClick={() => setSelectedTanaman(null)} 
          className="w-full md:w-auto px-12 py-3 bg-gray-800 text-white rounded-2xl font-bold hover:bg-gray-900 transition shadow-lg"
        >
          Tutup Detail
        </button>
      </div>

    </div>
    {/* --- FOOTER SECTION --- */}
<footer className="mt-12 pb-8 text-center">
  <div className="flex flex-col items-center gap-2">
    <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-green-300 to-transparent mb-4"></div>
    
    <p className="text-xs font-medium text-gray-400 tracking-widest uppercase">
      © 2026 Berbumi Database
    </p>
    
    <a 
      href="https://www.instagram.com/bayuutomo1618" 
      target="_blank" 
      rel="noopener noreferrer"
      className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
    >
      <span className="text-gray-500 text-[11px] font-bold uppercase tracking-tight group-hover:text-green-600 transition-colors">
        Developed by
      </span>
      <span className="text-sm font-black bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
        bayuutomo1618
      </span>
    
    </a>
    
    <p className="text-[10px] text-gray-300 italic mt-2">
      Built with ❤️ for Forum DAS Bodri
    </p>
  </div>
</footer>
  </div>
)}
        </div>
        <footer className="mt-12 pb-8 text-center">
  <div className="flex flex-col items-center gap-2">
    <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-green-300 to-transparent mb-4"></div>
    
    <p className="text-xs font-medium text-gray-400 tracking-widest uppercase">
      © 2026 Berbumi Database
    </p>
    
    <a 
      href="https://www.instagram.com/bayuutomo1618" 
      target="_blank" 
      rel="noopener noreferrer"
      className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
    >
      <span className="text-gray-500 text-[11px] font-bold uppercase tracking-tight group-hover:text-green-600 transition-colors">
        Developed by
      </span>
      <span className="text-sm font-black bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
        bayuutomo1618
      </span>
    </a>
    
    <p className="text-[15px] text-gray-500 italic mt-2">
      Built with ❤️ for Forum DAS Bodri
    </p>
  </div>
</footer>
        </div>
        
  );
}
export default App;