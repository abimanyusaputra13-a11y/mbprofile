import { DocumentReport } from '@/types';

export const mockDocuments: DocumentReport[] = [
  {
    id: 'doc-mb-01',
    documentCode: 'KUR-MB-2024',
    title: 'Buku Panduan Kurikulum S1 Manajemen Bisnis (144 SKS, Gelar S.M.)',
    category: 'Panduan Akademik & Kurikulum',
    year: 2024,
    issuingBody: 'Departemen Manajemen Bisnis ITS',
    publishDate: 'Agustus 2024',
    fileFormat: 'PDF',
    fileSize: '4.5 MB',
    description: 'Struktur kurikulum 144 SKS program sarjana S1 Manajemen Bisnis (Business Management) mencakup 4 bidang peminatan: Manajemen Keuangan, Operasi, Pemasaran, dan Manajemen Sumber Daya Manusia.',
    status: 'Resmi Publik',
    sampleUrl: '/samples/simulasi-kurikulum-s1-manajemen-bisnis.pdf'
  },
  {
    id: 'doc-bd-02',
    documentCode: 'KUR-BD-2024',
    title: 'Buku Panduan Kurikulum S1 Bisnis Digital (Gelar S.Bns.)',
    category: 'Panduan Akademik & Kurikulum',
    year: 2024,
    issuingBody: 'Departemen Manajemen Bisnis ITS',
    publishDate: 'Agustus 2024',
    fileFormat: 'PDF',
    fileSize: '4.2 MB',
    description: 'Panduan kurikulum program sarjana S1 Bisnis Digital (Digital Business) memadukan manajemen bisnis dengan inovasi teknologi digital, digital marketing, pemrograman bisnis, basis data, AI, dan e-commerce.',
    status: 'Resmi Publik',
    sampleUrl: '/samples/simulasi-kurikulum-s1-bisnis-digital.pdf'
  },
  {
    id: 'doc-akred-03',
    documentCode: 'AKRED-FIBAA-2025',
    title: 'Sertifikat Akreditasi Internasional FIBAA (Masa Berlaku 2025–2030) — S1 Manajemen Bisnis',
    category: 'Laporan Akreditasi',
    year: 2025,
    issuingBody: 'Foundation for International Business Administration Accreditation (FIBAA)',
    publishDate: '2025',
    fileFormat: 'PDF',
    fileSize: '2.1 MB',
    description: 'Dokumen sertifikasi akreditasi internasional FIBAA untuk Program Studi S1 Manajemen Bisnis ITS dengan masa berlaku 2025–2030.',
    status: 'Resmi Publik',
    sampleUrl: '/samples/simulasi-akreditasi-fibaa.pdf'
  },
  {
    id: 'doc-akred-04',
    documentCode: 'AKRED-UNGGUL-MB',
    title: 'Sertifikat Akreditasi Nasional Peringkat Unggul — S1 Manajemen Bisnis ITS',
    category: 'Laporan Akreditasi',
    year: 2024,
    issuingBody: 'Badan Akreditasi Nasional / LAMEMBA',
    publishDate: '2024',
    fileFormat: 'PDF',
    fileSize: '1.8 MB',
    description: 'Keputusan akreditasi nasional dengan peringkat tertinggi Unggul untuk Program Sarjana S1 Manajemen Bisnis ITS.',
    status: 'Resmi Publik',
    sampleUrl: '/samples/simulasi-akreditasi-unggul.pdf'
  },
  {
    id: 'doc-akred-05',
    documentCode: 'AKRED-BAIK-BD-2024',
    title: 'Sertifikat Akreditasi Nasional Peringkat Baik (2024–2029) — S1 Bisnis Digital ITS',
    category: 'Laporan Akreditasi',
    year: 2024,
    issuingBody: 'Badan Akreditasi Nasional Perguruan Tinggi',
    publishDate: '2024',
    fileFormat: 'PDF',
    fileSize: '1.9 MB',
    description: 'Dokumen penetapan peringkat akreditasi Baik untuk Program Studi Sarjana Bisnis Digital ITS masa berlaku 2024–2029.',
    status: 'Resmi Publik',
    sampleUrl: '/samples/simulasi-akreditasi-bisnis-digital.pdf'
  },
  {
    id: 'doc-renstra-06',
    documentCode: 'RENSTRA-MB-ITS',
    title: 'Rencana Strategis (Renstra) Pengembangan Departemen Manajemen Bisnis ITS',
    category: 'Rencana Strategis (Renstra)',
    year: 2025,
    issuingBody: 'Pimpinan Departemen Manajemen Bisnis ITS, FDKBD (CREABIZ)',
    publishDate: '2025',
    fileFormat: 'PDF',
    fileSize: '5.1 MB',
    description: 'Peta jalan strategis Departemen Manajemen Bisnis ITS dalam memperkuat keunggulan riset, kewirausahaan berbasis teknologi, internasionalisasi FIBAA, dan kontribusi industri nasional.',
    status: 'Resmi Publik',
    sampleUrl: '/samples/simulasi-renstra-mb-its.pdf'
  }
];

export const DOCUMENT_CATEGORIES_LIST: DocumentReport['category'][] = [
  'Panduan Akademik & Kurikulum',
  'Laporan Akreditasi',
  'Rencana Strategis (Renstra)',
  'Laporan Pertanggungjawaban (LPJ)',
  'SOP & Kemahasiswaan'
];

export const DOCUMENT_YEARS_LIST = ['Semua Tahun', '2026', '2025', '2024'];
