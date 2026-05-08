import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';

// Register Service Worker dengan auto-update
// Akan otomatis reload halaman saat ada update baru
registerSW({
  onNeedRefresh() {
    // SW baru tersedia, reload untuk update
    if (confirm('Update tersedia! Reload untuk mendapatkan versi terbaru?')) {
      window.location.reload()
    }
  },
  onOfflineReady() {
    console.log('Berbumi siap digunakan secara offline!')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
