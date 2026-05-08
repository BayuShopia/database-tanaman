import React, { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import { usePagination } from '../context/usePagination';
import { useOfflineQueue } from '../context/useOfflineQueue';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

const StatusBadge = ({ kondisi }) => {
  const map = {
    Hidup:  { cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
    Atensi: { cls: "bg-amber-100 text-amber-700",     dot: "bg-amber-500"   },
    Mati:   { cls: "bg-red-100 text-red-700",         dot: "bg-red-500"     },
  };
  const s = map[kondisi] || map.Hidup;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {kondisi}
    </span>
  );
};

function Dashboard() {
  const { user } = useAuth();
  const { data: daftarTanaman, loading, hasMore, fetchData, setData } = usePagination("tanaman", 10, "tglTanam");
  const { queue, isOnline, isSyncing, enqueue, flushQueue } = useOfflineQueue();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTanaman, setSelectedTanaman] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);
  const [logForm, setLogForm] = useState({ aktivitas: 'Penyiraman', catatan: '' });
  const [form, setForm] = useState({
    acara: '', kode: '', kondisi: 'Hidup', lokasi: '', nama: '', namaLatin: '', sumber: '', koordinat: ''
  });
  const [toast, setToast] = useState(null); // { msg, type }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => { if (user) fetchData(false); }, [user]);
  useEffect(() => {
    if (selectedTanaman) ambilLogPerawatan(selectedTanaman.id);
    else setLogs([]);
  }, [selectedTanaman]);

  const ambilLogPerawatan = async (tanamanId) => {
    try {
      const snap = await getDocs(collection(db, "tanaman", tanamanId, "log_perawatan"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLogs(data.sort((a, b) => b.tanggal - a.tanggal));
    } catch (e) { console.error(e); }
  };

  const ubahKondisiTanaman = async (id, kondisiBaru) => {
    try {
      await updateDoc(doc(db, "tanaman", id), { kondisi: kondisiBaru });
      setData(prev => prev.map(t => t.id === id ? { ...t, kondisi: kondisiBaru } : t));
      setSelectedTanaman(prev => ({ ...prev, kondisi: kondisiBaru }));
      showToast(`✅ Status diubah menjadi ${kondisiBaru}`, 'success');
    } catch (err) { showToast('Gagal update status: ' + err.message, 'error'); }
  };

  const simpanTanaman = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      penanam: user.nama,
      userId: user.id,
    };

    if (isOnline) {
      // ── ONLINE: langsung simpan ke Firestore ──────────────────────────────
      try {
        const docRef = await addDoc(collection(db, "tanaman"), {
          ...payload,
          tglTanam: serverTimestamp(),
        });
        const dataBaru = {
          id: docRef.id,
          ...payload,
          tglTanam: { toDate: () => new Date() },
        };
        setData(prev => [dataBaru, ...prev]);
        setForm({ acara: '', kode: '', kondisi: 'Hidup', lokasi: '', nama: '', namaLatin: '', sumber: '', koordinat: '' });
        setIsModalOpen(false);
        // Toast sukses
        showToast('✅ Data berhasil disimpan!', 'success');
      } catch (err) {
        showToast('❌ Gagal menyimpan: ' + err.message, 'error');
      }
    } else {
      // ── OFFLINE: simpan ke antrian localStorage ───────────────────────────
      const localId = enqueue("tanaman", {
        ...payload,
        tglTanam: new Date().toISOString(), // placeholder, akan diganti serverTimestamp saat sync
      });

      // Optimistic update — tampilkan di list dengan marker "pending"
      const dataBaru = {
        id: localId,
        ...payload,
        tglTanam: { toDate: () => new Date() },
        _pending: true, // marker untuk UI
      };
      setData(prev => [dataBaru, ...prev]);
      setForm({ acara: '', kode: '', kondisi: 'Hidup', lokasi: '', nama: '', namaLatin: '', sumber: '', koordinat: '' });
      setIsModalOpen(false);
      showToast('📶 Offline — data disimpan lokal, akan sync saat online', 'offline');
    }
  };

  const simpanLog = async (e) => {
    e.preventDefault();
    if (!logForm.catatan) return showToast('Isi catatan dulu!', 'error');
    try {
      await addDoc(collection(db, "tanaman", selectedTanaman.id, "log_perawatan"), {
        ...logForm, tanggal: serverTimestamp(), petugas: user.nama, petugasId: user.id
      });
      setLogForm({ aktivitas: 'Penyiraman', catatan: '' });
      ambilLogPerawatan(selectedTanaman.id);
      showToast('✅ Catatan tersimpan!', 'success');
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
  };

  const ambilGPS = () => {
    if (!navigator.geolocation) return showToast('Browser tidak mendukung GPS', 'error');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setForm({ ...form, koordinat: `${pos.coords.latitude}, ${pos.coords.longitude}` }); showToast('📍 Lokasi dikunci!', 'success'); },
      (err) => showToast('Gagal ambil GPS: ' + err.message, 'error'),
      { enableHighAccuracy: true }
    );
  };

  const tanamanFilter = daftarTanaman.filter((t) => {
    const s = searchTerm.toLowerCase();
    return t.nama?.toLowerCase().includes(s) || t.kode?.toLowerCase().includes(s) || t.lokasi?.toLowerCase().includes(s);
  });

  const formatTanggal = (ts) => {
    if (!ts) return "-";
    const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const hitungUsiaTanaman = (tglTanam) => {
    if (!tglTanam) return "Tanggal tidak tersedia";
    const tglAwal = typeof tglTanam.toDate === 'function' ? tglTanam.toDate() : new Date(tglTanam);
    const sekarang = new Date();
    let tahun = sekarang.getFullYear() - tglAwal.getFullYear();
    let bulan = sekarang.getMonth() - tglAwal.getMonth();
    let hari = sekarang.getDate() - tglAwal.getDate();
    if (hari < 0) { bulan -= 1; hari += new Date(sekarang.getFullYear(), sekarang.getMonth(), 0).getDate(); }
    if (bulan < 0) { tahun -= 1; bulan += 12; }
    return `${tahun} Tahun ${bulan} Bulan ${hari} Hari`;
  };

  const isAdmin = user?.role === 'admin';
  const bolehInput = isAdmin || user?.role === 'surveyor';

  const exportCSV = () => {
    if (tanamanFilter.length === 0) return alert("Tidak ada data tanaman untuk diexport");
    const header = ["Kode","Nama Lokal","Nama Latin","Lokasi","Kondisi","Tanggal Tanam","Penanam","Koordinat"];
    const rows = tanamanFilter.map((t) => [t.kode||"",t.nama||"",t.namaLatin||"",t.lokasi||"",t.kondisi||"",formatTanggal(t.tglTanam),t.penanam||"",t.koordinat||""]);
    const csv = [header,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `daftar_tanaman_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* ── TOAST NOTIFICATION ─────────────────────────────────────────── */}
        {toast && (
          <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold animate-slide-up max-w-sm ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' :
            toast.type === 'offline' ? 'bg-amber-500 text-white' :
            'bg-red-500 text-white'
          }`}>
            <span>{toast.msg}</span>
            <button onClick={() => setToast(null)} className="ml-auto opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* ── STATUS BAR: Online/Offline + Pending Queue ─────────────────── */}
        {(!isOnline || queue.length > 0) && (
          <div className={`mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-bold ${
            !isOnline
              ? 'bg-amber-50 border border-amber-200 text-amber-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${!isOnline ? 'bg-amber-500' : 'bg-blue-500 animate-pulse'}`} />
              {!isOnline
                ? '📶 Kamu sedang offline — data baru akan disimpan lokal'
                : `🔄 Menyinkronkan ${queue.length} data ke server...`}
            </div>
            {isOnline && queue.length > 0 && (
              <button
                onClick={flushQueue}
                disabled={isSyncing}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isSyncing ? 'Syncing...' : `Sync Sekarang (${queue.length})`}
              </button>
            )}
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              🌿 <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Berbumi</span> Database
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-500 text-sm font-medium">Monitoring Reforestasi DAS Bodri</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-72">
              <input
                type="text"
                placeholder="Cari nama, kode, atau lokasi..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 focus:border-green-500 rounded-2xl outline-none transition-all shadow-sm text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3.5 top-3 text-gray-400 text-sm">🔍</span>
            </div>
            {bolehInput && (
              <button onClick={exportCSV} className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm transition-all active:scale-95">
                ⬇️ Export CSV
              </button>
            )}
            {bolehInput && (
              <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-green-500/20 transition-all active:scale-95">
                + Tambah
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Tanaman</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Lokasi</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tanamanFilter.length > 0 ? tanamanFilter.map((t) => (
                  <tr key={t.id} className={`hover:bg-green-50/50 transition-colors cursor-pointer group ${t._pending ? 'opacity-70' : ''}`} onClick={() => !t._pending && setSelectedTanaman(t)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">{t.nama}</span>
                        {t._pending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 italic mt-0.5">{t.namaLatin || '-'}</div>
                      <div className="text-[11px] text-green-600 mt-1 font-mono font-bold">{t.kode}</div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <div className="text-sm text-gray-700 font-medium">{t.lokasi}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold mt-0.5">{t.acara || '-'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge kondisi={t.kondisi} />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-5 py-16 text-center">
                      <div className="text-4xl mb-3">{loading ? '⏳' : '🌱'}</div>
                      <p className="text-gray-400 font-medium text-sm">{loading ? 'Menyinkronkan data...' : 'Data tidak ditemukan'}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="p-4 border-t border-gray-50 bg-gray-50/50">
              <button onClick={() => fetchData(true)} disabled={loading}
                className={`w-full py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-2 border-green-500 text-green-700 hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:text-white hover:border-transparent shadow-sm'}`}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    MEMUAT DATA...
                  </span>
                ) : 'TAMPILKAN LEBIH BANYAK'}
              </button>
            </div>
          )}
          {!hasMore && tanamanFilter.length > 0 && (
            <div className="p-4 border-t border-gray-50 text-center">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">— Akhir dari data pohon —</p>
            </div>
          )}
        </div>

        {/* MODAL TAMBAH */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
              <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-green-600 to-emerald-600 shrink-0">
                <div>
                  <h2 className="text-lg font-black text-white">🌱 Input Data Pohon Baru</h2>
                  {!isOnline && (
                    <p className="text-amber-200 text-xs font-medium mt-0.5">📶 Mode offline — data akan disimpan lokal</p>
                  )}
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition">✕</button>
              </div>
              <form onSubmit={simpanTanaman} className="flex flex-col overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Kode Pohon</label>
                      <input className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white px-3 py-2.5 rounded-xl outline-none transition-all text-sm font-medium" placeholder="FB1001" required value={form.kode} onChange={(e) => setForm({...form, kode: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Nama Lokal</label>
                      <input className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white px-3 py-2.5 rounded-xl outline-none transition-all text-sm font-medium" placeholder="Beringin" required value={form.nama} onChange={(e) => setForm({...form, nama: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Nama Latin</label>
                    <input className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white px-3 py-2.5 rounded-xl outline-none transition-all text-sm" placeholder="Ficus benjamina" value={form.namaLatin} onChange={(e) => setForm({...form, namaLatin: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Lokasi Penanaman</label>
                    <input className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white px-3 py-2.5 rounded-xl outline-none transition-all text-sm" placeholder="Lokasi Penanaman" value={form.lokasi} onChange={(e) => setForm({...form, lokasi: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Sumber Bibit</label>
                    <input className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white px-3 py-2.5 rounded-xl outline-none transition-all text-sm" placeholder="Sumber Bibit" value={form.sumber} onChange={(e) => setForm({...form, sumber: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Acara</label>
                    <input className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white px-3 py-2.5 rounded-xl outline-none transition-all text-sm" placeholder="Dalam rangka acara apa?" value={form.acara} onChange={(e) => setForm({...form, acara: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Koordinat GPS</label>
                    <div className="flex gap-2">
                      <input className="flex-1 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white px-3 py-2.5 rounded-xl outline-none transition-all font-mono text-sm" placeholder="-7.1234, 110.5678" value={form.koordinat} onChange={(e) => setForm({...form, koordinat: e.target.value})} />
                      <button type="button" onClick={ambilGPS} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0">📍 GPS</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Kondisi</label>
                    <select className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 px-3 py-2.5 rounded-xl outline-none transition-all text-sm" value={form.kondisi} onChange={(e) => setForm({...form, kondisi: e.target.value})}>
                      <option value="Hidup">🌱 Hidup</option>
                      <option value="Atensi">⚠️ Perlu Perhatian</option>
                      <option value="Mati">🥀 Mati</option>
                    </select>
                  </div>
                </div>
                <div className="p-5 bg-gray-50 border-t flex gap-3 shrink-0">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all text-sm">Batal</button>
                  <button type="submit" className={`flex-[2] text-white font-bold py-3 rounded-2xl shadow-lg transition-all active:scale-95 text-sm ${
                    isOnline
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-500/20'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/20'
                  }`}>
                    {isOnline ? 'Simpan Data' : '📶 Simpan Offline'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DETAIL */}
        {selectedTanaman && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white flex justify-between items-start shrink-0">
                <div>
                  <h2 className="text-2xl font-black">{selectedTanaman.nama}</h2>
                  <p className="text-green-200 italic text-sm mt-0.5">{selectedTanaman.namaLatin || 'Nama latin tidak tersedia'}</p>
                  <div className="mt-2"><StatusBadge kondisi={selectedTanaman.kondisi} /></div>
                </div>
                <button onClick={() => setSelectedTanaman(null)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition text-lg">✕</button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                      <p className="text-[10px] uppercase font-black text-green-600 mb-1">Didata/Ditanam Oleh</p>
                      <p className="text-sm font-bold text-gray-800">{selectedTanaman.penanam || "Anggota Forum"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                      <p className="text-[10px] uppercase font-black text-gray-400 mb-2">Informasi Dasar</p>
                      {[
                        ["Kode", selectedTanaman.kode],
                        ["Sumber", selectedTanaman.sumber || '-'],
                        ["Acara", selectedTanaman.acara || '-'],
                        ["Tanggal Tanam", formatTanggal(selectedTanaman.tglTanam)],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span className="text-gray-500 font-medium">{k}</span>
                          <span className="font-bold text-gray-800 text-right ml-2">{v}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm pt-1 border-t border-gray-200">
                        <span className="text-gray-500 font-medium">Usia Pohon</span>
                        <span className="font-bold text-blue-600 text-right ml-2">{hitungUsiaTanaman(selectedTanaman.tglTanam)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 p-3.5 rounded-2xl border border-blue-100">
                      <span className="text-xl">📍</span>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] text-blue-500 font-bold uppercase mb-0.5">Koordinat</p>
                        <p className="text-xs text-blue-800 font-mono truncate">{selectedTanaman.koordinat || 'Belum diset'}</p>
                      </div>
                      {selectedTanaman.koordinat && (
                        <a href={`https://www.google.com/maps?q=${encodeURIComponent(selectedTanaman.koordinat)}`} target="_blank" rel="noreferrer"
                          className="bg-blue-600 text-white text-[10px] px-3 py-1.5 rounded-xl font-bold hover:bg-blue-700 shrink-0 transition-all">
                          Maps
                        </a>
                      )}
                    </div>
                    {isAdmin && (
                      <div>
                        <p className="text-[10px] uppercase font-black text-gray-400 mb-2">Update Kondisi</p>
                        <div className="flex gap-2">
                          {['Hidup', 'Atensi', 'Mati'].map((status) => (
                            <button key={status} onClick={() => ubahKondisiTanaman(selectedTanaman.id, status)}
                              className={`flex-1 py-2 px-1 rounded-xl text-[10px] font-bold transition-all border-2 ${
                                selectedTanaman.kondisi === status
                                  ? status === 'Mati' ? 'bg-red-500 border-red-500 text-white' : status === 'Atensi' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-green-500 border-green-500 text-white'
                                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                              }`}>
                              {status === 'Hidup' ? '🌱 Hidup' : status === 'Mati' ? '🥀 Mati' : '⚠️ Atensi'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 min-h-[320px]">
                    <p className="text-[10px] uppercase font-black text-green-700 mb-3 shrink-0">Riwayat Perawatan</p>
                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                      {logs.length > 0 ? logs.map((log) => (
                        <div key={log.id} className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-green-400">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-gray-700 text-xs">{log.aktivitas}</span>
                            <span className="text-[9px] text-gray-400">{formatTanggal(log.tanggal)}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{log.catatan}</p>
                          <span className="text-[9px] text-green-600 font-bold uppercase">Oleh: {log.petugas}</span>
                        </div>
                      )) : (
                        <p className="text-xs text-gray-400 italic text-center mt-8">Belum ada catatan perawatan.</p>
                      )}
                    </div>
                    {bolehInput ? (
                      <form onSubmit={simpanLog} className="space-y-2 pt-3 border-t border-gray-200 mt-3 shrink-0">
                        <select className="w-full bg-white border-2 border-gray-200 focus:border-green-500 p-2 text-xs rounded-xl outline-none" value={logForm.aktivitas} onChange={(e) => setLogForm({...logForm, aktivitas: e.target.value})}>
                          <option value="Penyiraman">💧 Penyiraman</option>
                          <option value="Pemupukan">🧪 Pemupukan</option>
                          <option value="Pemangkasan">✂️ Pemangkasan</option>
                          <option value="Monitoring">🔍 Monitoring Rutin</option>
                        </select>
                        <textarea placeholder="Catatan kondisi..." className="w-full bg-white border-2 border-gray-200 focus:border-green-500 p-2 text-xs rounded-xl h-16 outline-none resize-none" value={logForm.catatan} onChange={(e) => setLogForm({...logForm, catatan: e.target.value})} />
                        <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-xl text-xs font-bold hover:from-green-500 hover:to-emerald-500 transition-all active:scale-95">Simpan Update</button>
                      </form>
                    ) : (
                      <p className="text-[10px] text-gray-400 italic text-center pt-3 border-t border-gray-200 mt-3">Login sebagai Surveyor untuk menambah log.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 bg-gray-50 border-t shrink-0">
                <button onClick={() => setSelectedTanaman(null)} className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold transition-all active:scale-95 text-sm">Tutup Detail</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
