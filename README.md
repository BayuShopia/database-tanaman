# 🌿 Berbumi Database

Platform Monitoring Reforestasi DAS Bodri — Modern, PWA-enabled, dan mobile-friendly.

## ✨ Fitur Utama

- **🌱 Database Pohon**: Monitoring real-time kondisi pohon yang ditanam dengan sistem pagination
- **🌳 Hitung Karbon**: Estimasi serapan CO₂ menggunakan metode Chave (2005) + Global Wood Density Database
- **🏠 Rumah Bibit**: Manajemen stok bibit per rumah pembibitan (HE & FB)
- **📦 Riwayat Distribusi**: Tracking distribusi bibit ke lokasi penanaman
- **📥 Export CSV**: Export data ke CSV untuk analisis lebih lanjut
- **📱 PWA**: Install sebagai aplikasi di perangkat mobile/desktop
- **🔒 Role-based Access**: Admin, Surveyor, Petugas Bibit, Guest

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS v4 + Inter Font
- **Database**: Firebase Firestore (offline persistence enabled)
- **PWA**: vite-plugin-pwa + Workbox
- **Routing**: React Router v7
- **CSV**: PapaParse + FileSaver.js

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Firebase Security Rules

File `firestore.rules` sudah disediakan. Deploy ke Firebase:

```bash
# Install Firebase CLI (jika belum)
npm install -g firebase-tools

# Login ke Firebase
firebase login

# Initialize Firebase (pilih Firestore)
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules
```

### Struktur Security Rules

- **users**: 
  - READ: Public (untuk login)
  - CREATE: Public (registrasi dengan role default 'guest')
  - UPDATE/DELETE: Admin only (via Console/SDK)

- **tanaman**: 
  - READ: Public
  - CREATE: Admin & Surveyor
  - UPDATE: Admin & Surveyor (kondisi pohon)
  - DELETE: Admin only (via SDK)
  - **Sub-collection log_perawatan**:
    - READ: Public
    - CREATE: Admin & Surveyor
    - UPDATE/DELETE: Tidak diizinkan (immutable audit trail)

- **stok_bibit**: 
  - READ: Public
  - CREATE: Admin & Petugas Bibit
  - UPDATE: Admin & Petugas Bibit (edit stok, kurangi saat keluar)
  - DELETE: Admin only (via SDK)

- **bibit_keluar**: 
  - READ: Public
  - CREATE: Admin & Petugas Bibit
  - UPDATE/DELETE: Tidak diizinkan (immutable audit trail)

## 🎨 UI/UX Improvements

### Modern Youth-Oriented Design
- **Color Palette**: Slate-900 backgrounds, Green-600/Emerald-600 primary, white cards
- **Typography**: Inter font family (modern, clean, professional)
- **Glassmorphism**: Backdrop blur effects on modals and overlays
- **Gradient Buttons**: Smooth green-to-emerald gradients with shadow effects
- **Rounded Corners**: Consistent rounded-2xl/3xl throughout
- **Smooth Transitions**: All interactive elements have smooth hover/active states
- **Status Badges**: Colored pills with dots for visual clarity
- **Custom Scrollbar**: Styled scrollbar with green gradient
- **Responsive**: Mobile-first design with adaptive layouts

### Component Highlights
- **Login**: Gradient background with floating blobs, glassmorphism card
- **Navbar**: Sticky with scroll effect, gradient logo, role badges
- **Dashboard**: Gradient page background, modern table with hover states, detailed modal with tabs
- **Rumah Bibit**: Stats cards with gradient, icon-only action buttons
- **Hitung Karbon**: Two-column layout, gradient stats, methodology panel
- **Forms**: Gradient headers, styled inputs with focus states, smooth animations

## 📱 PWA Features

- **Installable**: Dapat diinstall sebagai aplikasi standalone
- **Offline Support**: Firestore offline persistence + Service Worker caching
- **Auto Update**: Service worker auto-update saat ada versi baru
- **Manifest**: Configured dengan icons, theme color, dan display mode
- **Runtime Caching**: Firestore API calls di-cache untuk performa optimal

### Install PWA

1. Buka aplikasi di browser (Chrome/Edge/Safari)
2. Klik icon "Install" di address bar
3. Atau buka menu → "Install Berbumi"
4. Aplikasi akan muncul di home screen/app drawer

## 🔧 Configuration

### Firebase Config

Edit `src/firebaseConfig.js` dengan kredensial Firebase Anda:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### PWA Config

Edit `vite.config.js` untuk customize PWA settings:

```javascript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Berbumi Database',
    short_name: 'Berbumi',
    theme_color: '#15803d',
    // ... other settings
  }
})
```

## 📊 Data Structure

### Firestore Collections

```
users/
  {userId}/
    - nama: string
    - pin: string
    - role: 'admin' | 'surveyor' | 'petugas_bibit' | 'guest'
    - tglDaftar: timestamp

tanaman/
  {tanamanId}/
    - nama: string
    - namaLatin: string
    - kode: string
    - kondisi: 'Hidup' | 'Atensi' | 'Mati'
    - lokasi: string
    - koordinat: string
    - acara: string
    - sumber: string
    - tglTanam: timestamp
    - penanam: string
    - userId: string
    
    log_perawatan/
      {logId}/
        - aktivitas: 'Penyiraman' | 'Pemupukan' | 'Pemangkasan' | 'Monitoring'
        - catatan: string
        - tanggal: timestamp
        - petugas: string
        - petugasId: string

stok_bibit/
  {stokId}/
    - namaBibit: string
    - namaLatin: string
    - jumlah: number
    - satuan: 'polybag' | 'tray' | 'batang'
    - kondisi: 'Sehat' | 'Perlu Perhatian' | 'Rusak'
    - rumahBibitId: 'HE' | 'FB'
    - keterangan: string
    - updatedAt: timestamp
    - updatedBy: string

bibit_keluar/
  {keluarId}/
    - stokBibitId: string
    - rumahBibitId: 'HE' | 'FB'
    - namaBibit: string
    - jumlahKeluar: number
    - tujuan: string
    - tanggal: timestamp
    - petugas: string
```

## 🚀 Deployment

### Netlify

1. Push code ke GitHub
2. Connect repository di Netlify
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy!

File `public/_redirects` sudah dikonfigurasi untuk SPA routing.

### Vercel

```bash
npm install -g vercel
vercel
```

### Firebase Hosting

```bash
firebase init hosting
# Pilih 'dist' sebagai public directory
# Configure as SPA: Yes
firebase deploy --only hosting
```

## 👥 User Roles

- **Admin**: Full access (CRUD semua data, ubah kondisi pohon, hapus data)
- **Surveyor**: Input & edit data pohon, tambah log perawatan
- **Petugas Bibit**: Kelola stok bibit, catat bibit keluar
- **Guest**: Read-only access

## 📝 License

Built with ❤️ for Forum DAS Bodri

## 👨‍💻 Developer

**bayuutomo1618**  
Instagram: [@bayuutomo1618](https://www.instagram.com/bayuutomo1618)

---

**Note**: Aplikasi ini menggunakan custom authentication (PIN-based) yang disimpan di Firestore. Untuk keamanan maksimal di production, pertimbangkan untuk migrasi ke Firebase Authentication.
