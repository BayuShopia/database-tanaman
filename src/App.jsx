import { useAuth } from "./context/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


import Dashboard from "./pages/Dashboard";
import HitungKarbon from "./pages/HitungKarbon";
import About from "./pages/About";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RumahBibit from "./pages/RumahBibit"
import RiwayatBibitKeluar from "./pages/RiwayatBibitKeluar";

function App() {
  const { user } = useAuth();

  if (!user) return <Login />;

  return (
    <BrowserRouter>
      <Navbar />
      <main className="flex-1">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/karbon" element={<HitungKarbon />} />
        <Route path="/rumah-bibit" element={<RumahBibit />} />
        <Route path="/riwayat-bibit-keluar" element={<RiwayatBibitKeluar/>} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
