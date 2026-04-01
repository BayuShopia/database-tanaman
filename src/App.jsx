import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';

function App() {
  const [daftarTanaman, setDaftarTanaman] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // STATE BARU: Untuk mengontrol Modal (Buka/Tutup)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // STATE BARU: Untuk menyimpan tanaman yang sedang dilihat detailnya
  const [selectedTanaman, setSelectedTanaman] = useState(null);

  //state untuk filter
  const [searchTerm, setSearchTerm] = useState('');

const [logs, setLogs] = useState([]);

const ubahKondisiTanaman = async (id, kondisiBaru) => {
  try {
    const tanamanRef = doc(db, "tanaman", id);
    await updateDoc(tanamanRef, {
      kondisi: kondisiBaru
    });

    // Perbarui state lokal agar tampilan langsung berubah tanpa reload
    setDaftarTanaman(prev => 
      prev.map(t => t.id === id ? { ...t, kondisi: kondisiBaru } : t)
    );
    
    // Perbarui juga selectedTanaman agar modal detail ikut berubah
    setSelectedTanaman(prev => ({ ...prev, kondisi: kondisiBaru }));

    alert(`Status berhasil diubah menjadi ${kondisiBaru}`);
  } catch (err) {
    alert("Gagal update status: " + err.message);
  }
};

const ambilGPS = () => {
  if (!navigator.geolocation) return alert("Browser tidak mendukung GPS");

  const options = {
    enableHighAccuracy: true, // Wajib untuk di gunung
    timeout: 10000,           // Menunggu sinyal 10 detik
    maximumAge: 0
  };

  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    setForm({ ...form, koordinat: `${lat}, ${lng}` });
    alert("Lokasi berhasil dikunci!");
  }, (err) => {
    alert("Gagal ambil lokasi: " + err.message);
  }, options);
};

// Fungsi untuk mengambil riwayat perawatan dari sub-koleksi
const ambilLogPerawatan = async (tanamanId) => {
  try {
    const logRef = collection(db, "tanaman", tanamanId, "log_perawatan");
    const querySnapshot = await getDocs(logRef);
    const dataLog = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Urutkan berdasarkan tanggal terbaru
    setLogs(dataLog.sort((a, b) => b.tanggal - a.tanggal));
  } catch (e) {
    console.error("Gagal ambil log:", e);
  }
};

// Trigger ambil log saat selectedTanaman berubah
useEffect(() => {
  if (selectedTanaman) {
    ambilLogPerawatan(selectedTanaman.id);
  } else {
    setLogs([]); // Reset log saat modal tutup
  }
}, [selectedTanaman]);

const [logForm, setLogForm] = useState({ aktivitas: 'Penyiraman', catatan: '' });

const simpanLog = async (e) => {
  e.preventDefault();
  if (!logForm.catatan) return alert("Isi catatan dulu, Bayu!");

  try {
    const logRef = collection(db, "tanaman", selectedTanaman.id, "log_perawatan");
    await addDoc(logRef, {
      ...logForm,
      tanggal: Timestamp.now()
    });

    setLogForm({ aktivitas: 'Penyiraman', catatan: '' });
    ambilLogPerawatan(selectedTanaman.id); // Refresh list log langsung
    alert("Catatan perawatan tersimpan!");
  } catch (err) {
    alert("Error: " + err.message);
  }
};

  const [form, setForm] = useState({
    acara: '', kode: '', kondisi: 'Hidup', lokasi: '', nama: '', namaLatin: '', sumber: '', koordinat: ''
  });

  const ambilData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "tanaman"));
      setDaftarTanaman(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { ambilData(); }, []);

  // LOGIKA FILTER: Mencocokkan nama atau kode dengan searchTerm
  const tanamanFilter = daftarTanaman.filter((t) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      t.nama?.toLowerCase().includes(searchLower) || 
      t.kode?.toLowerCase().includes(searchLower) ||
      t.lokasi?.toLowerCase().includes(searchLower)
    );
  });


  const simpanTanaman = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "tanaman"), { ...form, tglTanam: Timestamp.now() });
      alert("Berhasil disimpan!");
      setForm({ acara: '', kode: '', kondisi: 'Hidup', lokasi: '', nama: '', namaLatin: '', sumber: '', koordinat: '' });
      setIsModalOpen(false); // TUTUP MODAL SETELAH SIMPAN
      ambilData();
    } catch (err) { alert(err.message); }
  };

  // Fungsi Format Tanggal untuk tampilan
  const formatTanggal = (ts) => {
    if (!ts) return "-";
    const d = ts.toDate();
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
   <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
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
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-bold shadow-lg transition transform hover:scale-105"
            >
              + Tambah
            </button>
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
                    <td className="px-5 py-4">
                      <div className="text-sm text-gray-800">{t.lokasi}</div>
                      <div className="text-xs text-gray-400">{t.acara}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                        ${t.kondisi === 'Hidup' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {t.kondisi}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-5 py-10 text-center text-gray-400 italic">
                    Data tidak ditemukan...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL FORM INPUT */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b flex justify-between items-center bg-green-50">
                <h2 className="text-xl font-bold text-green-900">Input Data Baru</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
              </div>
              
              <form onSubmit={simpanTanaman} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Kode Pohon</label>
                    <input className="w-full border-b-2 border-gray-200 focus:border-green-500 outline-none py-2" 
                      placeholder="Contoh: FB1001" required value={form.kode} 
                      onChange={(e) => setForm({...form, kode: e.target.value})} />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Nama Lokal</label>
                    <input className="w-full border-b-2 border-gray-200 focus:border-green-500 outline-none py-2" 
                      placeholder="Contoh: Beringin" required value={form.nama} 
                      onChange={(e) => setForm({...form, nama: e.target.value})} />
                  </div>
                </div>

                <input className="w-full border-b-2 border-gray-200 focus:border-green-500 outline-none py-2" 
                  placeholder="Nama Latin" value={form.namaLatin} 
                  onChange={(e) => setForm({...form, namaLatin: e.target.value})} />

                <input className="w-full border-b-2 border-gray-200 focus:border-green-500 outline-none py-2" 
                  placeholder="Lokasi Penanaman" value={form.lokasi} 
                  onChange={(e) => setForm({...form, lokasi: e.target.value})} />

                <input className="w-full border-b-2 border-gray-200 focus:border-green-500 outline-none py-2" 
                  placeholder="Sumber Bibit" value={form.sumber} 
                  onChange={(e) => setForm({...form, sumber: e.target.value})} />

                <input className="w-full border-b-2 border-gray-200 focus:border-green-500 outline-none py-2" 
                  placeholder="Dalam Rangka Acara Apa ?" value={form.acara} 
                  onChange={(e) => setForm({...form, acara: e.target.value})} />
                
                <input 
      className="flex-1 border-b-2 border-gray-200 focus:border-green-500 outline-none py-2 font-mono text-sm" 
      placeholder="-7.1234, 110.5678"
      value={form.koordinat}
      onChange={(e) => setForm({...form, koordinat: e.target.value})}
    />
    <button 
      type="button"
      onClick={ambilGPS}
      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-200"
    >
      📍 Ambil GPS
    </button>

                <select className="w-full border p-2 rounded-lg bg-gray-50" value={form.kondisi} 
                  onChange={(e) => setForm({...form, kondisi: e.target.value})}>
                  <option value="Hidup">🌱 Hidup</option>
                  <option value="Perlu Perhatian">⚠️ Perlu Perhatian</option>
                  <option value="Mati">🥀 Mati</option>
                </select>

                

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition">Batal</button>
                  <button type="submit" className="flex-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition">Simpan Data</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DETAIL TANAMAN */}
        {selectedTanaman && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="bg-green-700 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{selectedTanaman.nama}</h2>
                  <p className="text-green-200 italic">{selectedTanaman.namaLatin}</p>
                </div>
                <button onClick={() => setSelectedTanaman(null)} className="text-3xl">&times;</button>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase">Informasi Dasar</label>
                    <p className="text-gray-700"><strong>Kode:</strong> {selectedTanaman.kode}</p>
                    <p className="text-gray-700"><strong>Sumber:</strong> {selectedTanaman.sumber || '-'}</p>
                    <p className="text-gray-700"><strong>Acara:</strong> {selectedTanaman.acara || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase">Waktu Penanaman</label>
                    <p className="text-gray-700">{formatTanggal(selectedTanaman.tglTanam)}</p>
                  </div>
                  <div className="mt-4">
  <label className="block text-xs font-black text-gray-400 uppercase mb-2">Lokasi Geografis</label>
  <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
    <span className="text-xl">📍</span>
    <div className="flex-1">
      <p className="text-xs text-blue-800 font-mono">{selectedTanaman.koordinat || 'Koordinat belum diset'}</p>
    </div>
    {selectedTanaman.koordinat && (
      <a 
        href={`https://www.google.com/maps?q=${selectedTanaman.koordinat}`}
        target="_blank"
        rel="noreferrer"
        className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-blue-700"
      >
        Buka Maps
      </a>
    )}
  </div>
</div>
                  <div>
  <label className="block text-xs font-black text-gray-400 uppercase mb-2">Update Kondisi</label>
  <div className="flex gap-2">
    {['Hidup', 'Perlu Perhatian', 'Mati'].map((status) => (
      <button
        key={status}
        onClick={() => ubahKondisiTanaman(selectedTanaman.id, status)}
        className={`flex-1 py-2 px-1 rounded-lg text-[10px] font-bold transition ${
          selectedTanaman.kondisi === status 
            ? 'bg-green-600 text-white shadow-md' 
            : 'bg-white border text-gray-500 hover:bg-gray-100'
        } ${status === 'Mati' && selectedTanaman.kondisi === 'Mati' ? 'bg-red-600' : ''}`}
      >
        {status === 'Hidup' ? '🌱 Hidup' : status === 'Mati' ? '🥀 Mati' : '⚠️ Perhatian'}
      </button>
    ))}
  </div>
</div>
                </div>
                <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-300">
  <label className="block text-xs font-black text-green-700 uppercase">Riwayat & Input Perawatan</label>
  
  {/* LIST LOG (Scrollable) */}
  <div className="max-h-40 overflow-y-auto space-y-2 mb-4 pr-2 custom-scrollbar">
    {logs.length > 0 ? logs.map((log) => (
      <div key={log.id} className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-green-500 text-sm">
        <div className="flex justify-between items-start">
          <span className="font-bold text-gray-700">{log.aktivitas}</span>
          <span className="text-[10px] text-gray-400">{formatTanggal(log.tanggal)}</span>
        </div>
        <p className="text-gray-600 mt-1">{log.catatan}</p>
      </div>
    )) : (
      <p className="text-xs text-gray-400 italic">Belum ada catatan perawatan.</p>
    )}
  </div>

  {/* FORM INPUT LOG */}
  <form onSubmit={simpanLog} className="space-y-2 pt-2 border-t border-gray-200">
    <select 
      className="w-full p-2 text-sm border rounded-lg bg-white"
      value={logForm.aktivitas}
      onChange={(e) => setLogForm({...logForm, aktivitas: e.target.value})}
    >
      <option value="Penyiraman">💧 Penyiraman</option>
      <option value="Pemupukan">🧪 Pemupukan</option>
      <option value="Pemangkasan">✂️ Pemangkasan</option>
      <option value="Monitoring">🔍 Monitoring Rutin</option>
    </select>
    <textarea 
      placeholder="Catatan kondisi pohon..."
      className="w-full p-2 text-sm border rounded-lg h-16 outline-none focus:ring-1 focus:ring-green-500"
      value={logForm.catatan}
      onChange={(e) => setLogForm({...logForm, catatan: e.target.value})}
    />
    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-xl font-bold hover:bg-green-700 transition">
      Simpan Catatan
    </button>
  </form>
</div>
             
              </div>
              
              <div className="p-6 bg-gray-100 flex justify-end">
                 <button onClick={() => setSelectedTanaman(null)} className="px-8 py-2 bg-gray-800 text-white rounded-xl font-bold">Tutup</button>
              </div>
            </div>
          </div>
        )}
        </div>
        </div>
        
  );
}
export default App;