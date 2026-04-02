import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [nama, setNama] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login, daftar } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isRegister) {
      const res = await daftar(nama, pin);
      if (!res.success) setError(res.msg);
    } else {
      const res = await login(nama, pin);
      if (!res.success) setError(res.msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-900 p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border-t-8 border-green-500">
        <h1 className="text-3xl font-black text-green-800 mb-2">Berbumi</h1>
        <p className="text-gray-500 text-sm mb-8 italic">Database Reforestasi Das Bodri</p>

        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${!isRegister ? 'bg-white shadow text-green-700' : 'text-gray-400'}`}
          >Masuk</button>
          <button 
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${isRegister ? 'bg-white shadow text-green-700' : 'text-gray-400'}`}
          >Daftar</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nama Lengkap</label>
            <input 
              type="text" 
              placeholder="Contoh: Bayu Utomo"
              className="w-full border-2 p-3 rounded-2xl outline-none focus:border-green-500 transition"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </div>

          <div className="text-left">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">PIN Keamanan</label>
            <input 
              type="password" 
              placeholder="Masukkan PIN"
              className="w-full border-2 p-3 rounded-2xl outline-none focus:border-green-500 transition text-center tracking-widest"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-200 transition-all transform active:scale-95"
          >
            {isRegister ? 'BUAT AKUN' : 'MASUK SEKARANG'}
          </button>
        </form>

        <p className="mt-8 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          Internal Forum DAS Bodri
        </p>
      </div>
    </div>
  );
};

export default Login;