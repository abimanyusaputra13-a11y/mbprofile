# Portal Akademik Departemen Manajemen Bisnis ITS
### Frontend Architecture & Major Platform Foundation

Platform web akademik modern untuk Departemen Manajemen Bisnis, Institut Teknologi Sepuluh Nopember (ITS), menaungi dua program studi sarjana: **S1 Manajemen Bisnis (Business Management)** dan **S1 Bisnis Digital (Digital Business)**. Terinspirasi oleh estetika visual, ritme komposisi, dan keterlibatan komunitas dari [RISE STEI-K](https://steik2026-rise-app-public.vercel.app/).

---

## 1. Ikhtisar & Tujuan Proyek

Proyek ini membangun fondasi frontend yang lengkap, responsif, berkinerja tinggi, dan siap diintegrasikan dengan backend di masa depan. Seluruh antarmuka dirancang dengan standar kredibilitas akademik tinggi namun tetap dinamis dan ramah mahasiswa.

### Ruang Lingkup Frontend (In-Scope):
- **Arsitektur Next.js 16 App Router** dengan TypeScript dan Tailwind CSS.
- **Sistem Desain & Tipografi Kurasi:** Perpaduan sans-serif geometris (*Plus Jakarta Sans*) dengan aksen editorial *script/serif* (*Playfair Display*), garis latar teknis (*grid-lines*), dan palet warna *Royal Cobalt Blue* & *Vibrant Amber*.
- **Enam Halaman Navigasi Utama:**
  1. `Home` (`/`)
  2. `Who Are We?` (`/about`)
  3. `Materi dan Soal` (`/materi-soal`)
  4. `Daftar Dosen` (`/dosen`)
  5. `Wall of Fame` (`/wall-of-fame`)
  6. `Laporan` (`/laporan`)
- **Penanganan Rute Invalid (404 Not Found):** Halaman kesalahan 404 kustom dengan tautan pemulihan navigasi.
- **Komponen UI Modular & Reusable:** Header sticky dengan deteksi scroll, drawer menu mobile dengan backdrop blur & keyboard listener, modal dialog aksesibel, dan kartu data kaya metadata.
- **Interaksi Frontend Fungsional:** Pencarian langsung multi-bidang, filter komprehensif, pratinjau dokumen, notifikasi umpan balik simulasi, dan salin tautan.
- **Pemisahan Data & Tampilan:** Seluruh dataset disimpan dalam modul TypeScript terpisah (`src/data/`), bukan ter-hardcode di dalam markup komponen.

---

## 2. Inventaris Rute (Route Inventory)

| No | Rute | Nama Halaman | Deskripsi & Fungsi Utama |
|---|---|---|---|
| 1 | `/` | **Home (Beranda)** | Hero section display besar, filosofi 4 pilar manajemen (FOMH), shortcut pill deep-links, materi unggulan, bulletin pengumuman, highlight prestasi Rektor Awards 2025, dan akreditasi FIBAA & Unggul. |
| 2 | `/about` | **Who Are We?** | Profil departemen CREABIZ ITS, visi & misi tridharma, 2 laboratorium riset resmi (ESME & BAS), struktur kepemimpinan, dan linimasa sejarah 2011–2025. |
| 3 | `/materi-soal` | **Materi dan Soal** | Repositori materi terbuka & kurikulum: live search, filter multi-kategori (Semester 1–8, Tipe Berkas, Mata Kuliah, Tahun), modal pratinjau berkas, dan modal kontribusi materi. |
| 4 | `/dosen` | **Daftar Dosen** | Direktori dosen & tenaga kependidikan: pencarian nama/laboratorium, filter unit/jabatan, serta modal profil lengkap tanpa rekayasa data pribadi. |
| 5 | `/wall-of-fame` | **Wall of Fame** | Etalase apresiasi mahasiswa: prestasi terverifikasi periode 2024–2026 dari register resmi departemen, lencana penghargaan, detail capaian, dan modal pelaporan prestasi mandiri. |
| 6 | `/laporan` | **Laporan** | Arsip dokumen publik & transparansi: Dokumen Kurikulum S1 MB (144 SKS) & S1 BD, Sertifikat Akreditasi FIBAA (2025–2030), SK Akreditasi BAN-PT/LAMEMBA, Renstra, dan modal feedback unduhan. |
| 7 | `/_not-found` | **404 Not Found** | Halaman ramah pengguna ketika rute URL tidak ditemukan, dilengkapi pintasan kembali ke rute yang valid. |

---

## 3. Desain Sistem & Token Visual

Sistem desain diadaptasi dari karakteristik visual referensi [RISE STEI-K](https://steik2026-rise-app-public.vercel.app/):

- **Palet Warna:**
  - `brand` (`#1d4ed8` / `#2563eb`): Royal Cobalt Blue untuk identitas utama akademik.
  - `brand-soft` (`#eff6ff`): Latar belakang kartu dan aksen lembut.
  - `brand-tint` (`#dbeafe`): Gradien transisi pada footer dan header.
  - `brand-yellow` (`#facc15` / `#fbbf24`): Aksen kontras tinggi untuk pill shortcut, tag akreditasi, dan lencana prestasi (Wall of Fame).
  - `neutral-900` (`#0f172a`): Tipografi judul kontras tinggi.
  - `neutral-600` (`#475569`): Teks paragraf dengan rasio kontras ramah keterbacaan (WCAG AAA).
- **Tipografi:**
  - Font Primer: `Plus Jakarta Sans` (Google Fonts via `next/font/google`).
  - Font Aksen Display (`text-script`): `Playfair Display` italic untuk sentuhan editorial elegan pada kata kunci judul (misal: "Welcome to *Informatika*", "Who Are *We?*").
- **Elemen Grafis & Animasi:**
  - `.grid-lines`: Pola garis kisi teknis berukuran 36px x 36px untuk memberikan kesan komputasi dan arsitektur presisi.
  - `.animate-float` & `.animate-float-slow`: Animasi mengambang dinamis untuk stiker visual akademis di hero banner.
  - Transisi hover interaktif dengan bayangan halus (`shadow-xl`) dan batas kartu responsif (`border-blue-400`).

---

## 4. Struktur Proyek & Komponen

```text
c:/Users/Administrator/Documents/This time for real/
├── src/
│   ├── app/
│   │   ├── about/
│   │   │   └── page.tsx           # Halaman Who Are We?
│   │   ├── dosen/
│   │   │   └── page.tsx           # Halaman Direktori Dosen
│   │   ├── laporan/
│   │   │   └── page.tsx           # Halaman Laporan & Dokumen Resmi
│   │   ├── materi-soal/
│   │   │   └── page.tsx           # Halaman Materi dan Bank Soal
│   │   ├── wall-of-fame/
│   │   │   └── page.tsx           # Halaman Wall of Fame
│   │   ├── globals.css            # Desain token, grid-lines, animasi
│   │   ├── layout.tsx             # Root layout, Google Fonts, SiteHeader, SiteFooter
│   │   ├── not-found.tsx          # Halaman 404 Kustom
│   │   └── page.tsx               # Halaman Beranda (Home)
│   ├── components/
│   │   ├── cards/
│   │   │   ├── AchievementCard.tsx
│   │   │   ├── DocumentCard.tsx
│   │   │   ├── LecturerCard.tsx
│   │   │   └── ResourceCard.tsx
│   │   ├── layout/
│   │   │   ├── DesktopNavigation.tsx
│   │   │   ├── MobileNavigation.tsx
│   │   │   ├── PageContainer.tsx
│   │   │   ├── SiteFooter.tsx
│   │   │   └── SiteHeader.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       ├── FilterSelect.tsx
│   │       ├── LoadingState.tsx
│   │       ├── Modal.tsx
│   │       ├── PageHeading.tsx
│   │       ├── PrimaryButton.tsx
│   │       ├── SearchInput.tsx
│   │       ├── SecondaryButton.tsx
│   │       ├── SectionHeading.tsx
│   │       └── SimulationNotice.tsx
│   ├── data/
│   │   ├── about.ts               # Data sejarah, visi-misi, organisasi, lab
│   │   ├── achievements.ts        # Data prestasi Wall of Fame
│   │   ├── announcements.ts       # Data pengumuman & bulletin
│   │   ├── documents.ts           # Data dokumen LPJ & kurikulum
│   │   ├── lecturers.ts           # Data dewan dosen & publikasi
│   │   ├── navigation.ts          # Konfigurasi menu rute
│   │   └── resources.ts           # Data materi kuliah & bank soal
│   └── types/
│       └── index.ts               # Interface TypeScript terpusat
├── docs/
│   └── backend-integration.md     # Panduan dan checklist integrasi backend
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. Menjalankan Aplikasi Secara Lokal

### Prasyarat:
- Node.js versi 18.18+ atau v20+ (Direkomendasikan v20+)
- npm versi 9+

### Langkah Instalasi & Menjalankan:
```bash
# 1. Masuk ke direktori proyek
cd "c:/Users/Administrator/Documents/This time for real"

# 2. Instal dependensi (jika belum terpasang)
npm install

# 3. Jalankan server pengembangan lokal (Next.js Turbopack)
npm run dev

# 4. Buka di peramban web
# http://localhost:3000
```

### Memvalidasi Build Produksi & Type-Check:
```bash
npm run build
```

---

## 6. Daftar Interaksi Ter-Simulasi & Batasan Frontend

Untuk mematuhi batasan bahwa proyek ini adalah tahap arsitektur frontend tanpa backend aktif:

1. **Unduh Berkas Materi & Laporan:**
   - Menampilkan modal umpan balik yang mengonfirmasi bahwa dokumen teridentifikasi, disertai komponen `SimulationNotice`.
   - Tidak memaksakan unduhan file dummy korup ke mesin pengguna.
2. **Formulir Pengajuan Materi & Prestasi:**
   - Formulir memvalidasi input wajib (HTML5 validation), menampilkan status berhasil sementara di tingkat state React, dan merinci kebutuhan endpoint upload serta antrean kurasi admin.
3. **Pencarian & Pemfilteran:**
   - Dijalankan 100% pada dataset lokal di memori klien dengan performa instan tanpa membebani server.
4. **Data Demonstrasi:**
   - Seluruh konten prestasi mahasiswa dan visi-misi diberi penanda eksplisit sebagai data percontohan representatif hingga dokumen resmi disinkronkan dari database universitas.

---

## 7. Rangkuman Pengujian Kualitas

- [x] **Kompilasi TypeScript:** Tidak ada kesalahan kompilasi (`tsc --noEmit` & `npm run build` sukses 100%).
- [x] **Integritas Rute:** 6 dari 6 halaman utama serta `/_not-found` berhasil di-prerender sebagai Static Pages.
- [x] **Aksesibilitas & Keyboard Navigation:** Modal dapat ditutup via tombol Escape; tautan navigasi menyertakan atribut `aria-current="page"`; formulir dilengkapi `label` terasosiasi.
- [x] **Tampilan Responsif:** Telah diuji pada lebar layar desktop (>= 1024px) dan mobile (< 768px) dengan menu slide-out drawer yang dapat dibuka dan ditutup dengan mulus.
