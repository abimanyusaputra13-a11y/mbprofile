# Panduan & Checklist Integrasi Backend
### Academic Major Platform — Phase 2 Architecture Handover

Dokumen ini merinci kebutuhan arsitektur backend, skema entitas data, antarmuka API, autentikasi/otorisasi, serta manajemen penyimpanan berkas yang diperlukan untuk menghubungkan antarmuka frontend ini ke sistem produksi.

---

## 1. Matriks Kebutuhan Halaman & Akses Database

| Halaman | Rute Frontend | Akses Database Diperlukan? | Tipe Operasi | Kebutuhan Autentikasi |
|---|---|---|---|---|
| **Home** | `/` | Ya | Read-Only | Publik (tanpa login) |
| **Who Are We?** | `/about` | Ya | Read-Only (Kecuali CMS Admin) | Publik (tanpa login) |
| **Materi dan Soal** | `/materi-soal` | Ya | Read, Write (Pengajuan), Filter | Baca: Publik / Mahasiswa.<br>Unggah: Mahasiswa Terdaftar (SSO ITB). |
| **Daftar Dosen** | `/dosen` | Ya | Read, Write (Jadwal Bimbingan) | Baca: Publik.<br>Booking Bimbingan: Mahasiswa login. |
| **Wall of Fame** | `/wall-of-fame` | Ya | Read, Write (Lapor Prestasi) | Baca: Publik.<br>Submit: Mahasiswa terdaftar. |
| **Laporan** | `/laporan` | Ya | Read-Only (Download Log) | Baca: Publik / Mahasiswa terdaftar. |

---

## 2. Entitas Data & Rekomendasi Skema Database

Struktur data frontend saat ini telah diselaraskan dengan interface TypeScript di [`src/types/index.ts`](../src/types/index.ts):

### A. Tabel `academic_resources` (Materi dan Soal)
```sql
CREATE TABLE academic_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  course_code VARCHAR(30) NOT NULL,
  course_name VARCHAR(150) NOT NULL,
  semester SMALLINT NOT NULL CHECK (semester BETWEEN 1 AND 8),
  resource_type VARCHAR(50) NOT NULL, -- 'Catatan Kuliah', 'Slide Dosen', 'Soal UTS', etc.
  academic_year VARCHAR(20) NOT NULL,
  file_format VARCHAR(10) NOT NULL,   -- 'PDF', 'ZIP', 'IPYNB', 'DOCX'
  file_size VARCHAR(20) NOT NULL,
  file_storage_key VARCHAR(500) NOT NULL, -- S3/R2 object path
  download_count INT DEFAULT 0,
  uploaded_by_user_id UUID REFERENCES users(id),
  author_display_name VARCHAR(150) NOT NULL,
  description TEXT,
  tags TEXT[],
  status VARCHAR(30) DEFAULT 'PENDING_APPROVAL', -- 'PUBLISHED', 'ARCHIVED', 'REJECTED'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### B. Tabel `lecturers` & `lecturer_specializations`
```sql
CREATE TABLE lecturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  academic_title VARCHAR(150) NOT NULL,
  nip VARCHAR(50) UNIQUE NOT NULL,
  laboratory VARCHAR(100) NOT NULL,
  rank VARCHAR(50) NOT NULL, -- 'Profesor', 'Lektor Kepala', 'Lektor', 'Asisten Ahli'
  email VARCHAR(150) UNIQUE NOT NULL,
  office VARCHAR(200) NOT NULL,
  google_scholar_url VARCHAR(500),
  scopus_url VARCHAR(500),
  avatar_url VARCHAR(500),
  bio TEXT,
  courses TEXT[],
  recent_research TEXT[],
  education TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### C. Tabel `student_achievements` (Wall of Fame)
```sql
CREATE TABLE student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'Kompetisi', 'Beasiswa', 'Riset & Publikasi', 'Proyek & Startup'
  level VARCHAR(50) NOT NULL,    -- 'Internasional', 'Nasional', 'Regional'
  year SMALLINT NOT NULL,
  award VARCHAR(150) NOT NULL,
  team_name VARCHAR(150),
  members TEXT[] NOT NULL,
  advisor VARCHAR(150),
  event_organizer VARCHAR(255) NOT NULL,
  description TEXT,
  certificate_storage_key VARCHAR(500),
  verification_status VARCHAR(30) DEFAULT 'SUBMITTED', -- 'APPROVED', 'REJECTED'
  badge_variant VARCHAR(20) DEFAULT 'gold',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### D. Tabel `official_documents` (Laporan)
```sql
CREATE TABLE official_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_code VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'Laporan Pertanggungjawaban (LPJ)', 'Panduan Kurikulum', etc.
  year SMALLINT NOT NULL,
  issuing_body VARCHAR(200) NOT NULL,
  publish_date DATE NOT NULL,
  file_format VARCHAR(10) NOT NULL,
  file_size VARCHAR(20) NOT NULL,
  file_storage_key VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'Resmi Publik',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Spesifikasi Endpoint REST API yang Diperlukan

### Endpoint Publik (Read-Only)
- `GET /api/v1/resources`
  - Query Params: `?search=...&semester=...&course=...&type=...&year=...&page=1&limit=12`
  - Response: `{ data: Resource[], total: number, page: number, totalPages: number }`
- `GET /api/v1/resources/:id`
  - Response: `{ data: Resource }`
- `GET /api/v1/lecturers`
  - Query Params: `?search=...&lab=...&rank=...`
  - Response: `{ data: Lecturer[] }`
- `GET /api/v1/achievements`
  - Query Params: `?category=...&year=...&search=...`
  - Response: `{ data: Achievement[] }`
- `GET /api/v1/documents`
  - Query Params: `?category=...&year=...&search=...`
  - Response: `{ data: DocumentReport[] }`
- `GET /api/v1/announcements`
  - Response: `{ data: Announcement[] }`

### Endpoint Terproteksi (Memerlukan Autentikasi / SSO)
- `POST /api/v1/resources/upload-presign`
  - Body: `{ filename: string, mimeType: string, fileSize: number }`
  - Response: `{ uploadUrl: string, storageKey: string, expiresAt: number }`
- `POST /api/v1/resources`
  - Body: `{ title, courseCode, courseName, semester, type, academicYear, storageKey, description, tags }`
  - Response: `{ success: true, message: 'Resource submitted for review' }`
- `GET /api/v1/resources/:id/download-link`
  - Response: `{ downloadUrl: string, expiresAt: number }` (Increments `download_count`)
- `POST /api/v1/achievements/submit`
  - Body: `{ title, category, level, year, award, members, organizer, description, certificateKey }`
  - Response: `{ success: true, submissionId: string }`

---

## 4. Rencana Autentikasi & Otorisasi

1. **Penyedia Autentikasi (Auth Provider):**
   - Kampus SSO via OpenID Connect (OIDC) / OAuth 2.0 (misalnya ITB Account / Google Workspace Universitas).
2. **Peran Pengguna (Role-Based Access Control):**
   - `STUDENT`: Mengunduh materi berkas penuh, mengajukan laporan prestasi mandiri, memesan bimbingan tugas akhir.
   - `LECTURER`: Menyesuaikan jadwal konsultasi, mengunggah slide kuliah resmi, memverifikasi permohonan bimbingan skripsi.
   - `ADMIN_STUDENT_AFFAIRS`: Memoderasi laporan prestasi Wall of Fame dan mengunggah dokumen kemahasiswaan/LPJ.
   - `ADMIN_ACADEMIC`: Menyetujui bank soal, mengelola data kurikulum dan profil dewan dosen.

---

## 5. Manajemen Berkas & Object Storage

- **Penyedia Storage:** Cloudflare R2 atau AWS S3 dengan *zero egress fees* untuk menghemat biaya bandwidth berkas perkuliahan.
- **Strategi Upload:** *Direct-to-Cloud Upload* via presigned PUT URLs untuk menghindari bottleneck beban CPU server aplikasi Next.js.
- **Proteksi Berkas:**
  - Dokumen resmi publik: CDN publik terdistribusi dengan caching TTL 1 hari.
  - Dokumen internal akademik: Presigned GET URL bertenggat waktu 15 menit dengan verifikasi sesi mahasiswa.

---

## 6. Checklist Langkah Implementasi Tahap 2

- [ ] Inisialisasi Database PostgreSQL & Prisma/Drizzle ORM.
- [ ] Buat migrasi tabel berdasarkan skema di atas.
- [ ] Konfigurasi bucket storage S3/R2 dan kredensial IAM.
- [ ] Integrasikan OpenID Connect (OIDC) authentication provider.
- [ ] Implementasikan API route handler di `src/app/api/...` sesuai spesifikasi REST di atas.
- [ ] Hubungkan fetch data React Server Components / React Query ke API backend.
- [ ] Hapus banner simulasi (`SimulationNotice`) setelah pipeline live diverifikasi.
