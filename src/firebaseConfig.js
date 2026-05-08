import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBA8fwlU51oSoQTlg9BBFonTmnzFDrw49Q",
  authDomain: "tanaman-e1608.firebaseapp.com",
  projectId: "tanaman-e1608",
  storageBucket: "tanaman-e1608.firebasestorage.app",
  messagingSenderId: "31986339186",
  appId: "1:31986339186:web:e55ed79d3599d9ab8e61eb",
  measurementId: "G-KZNSH70K8H",
};

const app = initializeApp(firebaseConfig);

// Gunakan persistentLocalCache (pengganti enableIndexedDbPersistence yang deprecated)
// Ini memungkinkan Firestore bekerja offline secara native
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
