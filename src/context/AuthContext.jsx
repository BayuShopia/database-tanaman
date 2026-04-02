import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('berbumi_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('berbumi_user');
      }
    }
    setLoading(false);
  }, []);

  // Fungsi DAFTAR dengan Cek Duplikasi
  const daftar = async (nama, pin) => {
    try {
      // 1. Cek apakah nama sudah terpakai
      const q = query(collection(db, "users"), where("nama", "==", nama));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return { success: false, msg: "Nama ini sudah terdaftar." };
      }

      // 2. Simpan user baru
      const docRef = await addDoc(collection(db, "users"), {
        nama: nama,
        pin: pin,
        role: 'guest',
        tglDaftar: serverTimestamp() // Gunakan waktu server
      });

      const userData = { id: docRef.id, nama, role: 'guest' };
      loginAction(userData);
      return { success: true };
    } catch (e) {
      return { success: false, msg: e.message };
    }
  };

  const login = async (nama, pin) => {
    try {
      const q = query(collection(db, "users"), 
                where("nama", "==", nama), 
                where("pin", "==", pin));
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const userData = { id: docSnap.id, ...docSnap.data() };
        loginAction(userData);
        return { success: true };
      }
      return { success: false, msg: "Nama atau PIN salah." };
    } catch (e) {
      return { success: false, msg: e.message };
    }
  };

  const loginAction = (userData) => {
    setUser(userData);
    localStorage.setItem('berbumi_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('berbumi_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, daftar, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);