import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { enableIndexedDbPersistence } from "firebase/firestore";


// Konfigurasi milikmu
const firebaseConfig = {
  apiKey: "AIzaSyBA8fwlU51oSoQTlg9BBFonTmnzFDrw49Q",
  authDomain: "tanaman-e1608.firebaseapp.com",
  projectId: "tanaman-e1608",
  storageBucket: "tanaman-e1608.firebasestorage.app",
  messagingSenderId: "31986339186",
  appId: "1:31986339186:web:e55ed79d3599d9ab8e61eb",
  measurementId: "G-KZNSH70K8H"
};

// 1. Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// 2. Hubungkan ke Firestore dan Export agar bisa dipakai di file lain
export const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        // Biasanya karena banyak tab terbuka
    } else if (err.code === 'unimplemented') {
        // Browser tidak mendukung
    }
});