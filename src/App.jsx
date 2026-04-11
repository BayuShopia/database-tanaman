
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Dashboard from "./pages/Dashboard";
import HitungKarbon from "./pages/HitungKarbon";
import About from "./pages/About";
import Login from "./components/Login";
import Navbar from "./components/Navbar";

function App() {
  const { user } = useAuth();

  if (!user) return <Login />;

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/karbon" element={<HitungKarbon />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
