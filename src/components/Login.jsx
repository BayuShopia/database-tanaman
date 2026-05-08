import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [nama, setNama] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, daftar } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
      const res = await daftar(nama, pin);
      if (!res.success) setError(res.msg);
    } else {
      const res = await login(nama, pin);
      if (!res.success) setError(res.msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-green-950 to-emerald-900 p-4">
      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="glass rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header gradient strip */}
          <div className="h-1.5 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400" />

          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 mb-4">
                <span className="text-3xl">🌿</span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Berbumi</h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">Database Reforestasi DAS Bodri</p>
            </div>

            {/* Tab Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 gap-1">
              <button
                onClick={() => { setIsRegister(false); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  !isRegister
                    ? 'bg-white shadow-sm text-green-700 shadow-green-100'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => { setIsRegister(true); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isRegister
                    ? 'bg-white shadow-sm text-green-700 shadow-green-100'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Daftar
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bayu Utomo"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white px-4 py-3 rounded-2xl outline-none transition-all text-gray-800 font-medium placeholder:text-gray-300"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  PIN Keamanan
                </label>
                <input
                  type="password"
                  placeholder="••••••"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white px-4 py-3 rounded-2xl outline-none transition-all text-center tracking-[0.5em] text-gray-800 font-bold placeholder:tracking-normal placeholder:text-gray-300"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-3 rounded-xl">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-60 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-500/30 transition-all transform active:scale-95 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Memproses...
                  </span>
                ) : isRegister ? 'BUAT AKUN' : 'MASUK SEKARANG'}
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] text-gray-400 uppercase tracking-widest font-bold">
              Internal Forum DAS Bodri
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
