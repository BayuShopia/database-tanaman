# ✅ PWA Setup Complete

## Cara Test PWA

### 1. **Deploy ke Server/Hosting**
PWA hanya berfungsi di:
- `https://` (production)
- `localhost` (development)

**Tidak berfungsi di `http://` non-localhost!**

### 2. **Test di Localhost**

```bash
# Jalankan preview server (sudah HTTPS-ready)
npm run preview

# Atau gunakan serve
npx serve dist -l 3000
```

Buka di browser: `http://localhost:4173` atau `http://localhost:3000`

### 3. **Verifikasi PWA di Browser**

#### Chrome/Edge DevTools:
1. Buka DevTools (F12)
2. Tab **Application**
3. Cek:
   - **Manifest**: Harus muncul "Berbumi Database" dengan semua icon
   - **Service Workers**: Harus ada SW aktif
   - **Storage > Cache Storage**: Harus ada cache setelah load pertama

#### Lighthouse Audit:
1. DevTools → **Lighthouse** tab
2. Pilih **Progressive Web App**
3. Klik **Generate report**
4. Score harus **90+**

### 4. **Install PWA**

#### Desktop (Chrome/Edge):
- Klik icon **Install** (⊕) di address bar
- Atau: Menu (⋮) → "Install Berbumi..."

#### Mobile (Android):
- Chrome: Menu → "Add to Home screen"
- Icon akan muncul di app drawer

#### Mobile (iOS/Safari):
- Tap tombol **Share** (⬆️)
- Scroll → "Add to Home Screen"
- Tap "Add"

### 5. **Test Offline**

1. Buka aplikasi
2. DevTools → **Network** tab
3. Centang **Offline**
4. Refresh halaman
5. Aplikasi harus tetap bisa dibuka (dari cache)

### 6. **Test Update**

1. Ubah sesuatu di code (misal: ubah title)
2. Build ulang: `npm run build`
3. Deploy/refresh server
4. Buka aplikasi
5. Harus muncul prompt: "Update tersedia! Reload untuk mendapatkan versi terbaru?"

## 🔍 Troubleshooting

### PWA tidak muncul di Chrome
- Pastikan akses via `https://` atau `localhost`
- Clear cache: DevTools → Application → Clear storage → Clear site data
- Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### Service Worker tidak register
- Cek console untuk error
- Pastikan `registerSW` di-import di `main.jsx`
- Cek DevTools → Application → Service Workers

### Icon tidak muncul
- Pastikan file PNG ada di `public/icons/`
- Cek manifest: DevTools → Application → Manifest
- Icon harus PNG (bukan SVG)

### Offline tidak berfungsi
- Pastikan sudah load halaman minimal 1x saat online
- Cek cache: DevTools → Application → Cache Storage
- Pastikan SW status = "activated"

## 📱 PWA Features yang Sudah Aktif

✅ **Installable** — Bisa diinstall sebagai app standalone  
✅ **Offline Support** — Firestore offline + SW caching  
✅ **Auto Update** — Prompt saat ada versi baru  
✅ **App Icons** — 6 ukuran (48px - 512px)  
✅ **Splash Screen** — Auto-generated dari manifest  
✅ **Theme Color** — Green (#15803d)  
✅ **Standalone Mode** — Fullscreen tanpa browser UI  
✅ **Runtime Caching** — Firestore API, Google Fonts, CSV  

## 🚀 Deploy ke Production

### Netlify
```bash
# Push ke GitHub
git add .
git commit -m "PWA ready"
git push

# Di Netlify dashboard:
# - Connect repository
# - Build command: npm run build
# - Publish directory: dist
# - Deploy!
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Firebase Hosting
```bash
firebase init hosting
# Public directory: dist
# Single-page app: Yes
firebase deploy --only hosting
```

Setelah deploy, test PWA di URL production dengan Lighthouse!

## 📊 Expected Lighthouse Scores

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 90+
- **PWA**: 100 ✅

---

**Note**: PWA membutuhkan HTTPS. Jika test di localhost, gunakan `http://localhost` (bukan IP address).
