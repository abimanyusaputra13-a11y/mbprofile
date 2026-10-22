import { Announcement } from '@/types';

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-01',
    title: 'Capaian Prestasi Rektor Awards ITS 2025: Departemen Manajemen Bisnis Raih 3 Penghargaan Utama',
    date: '10 Februari 2026',
    category: 'Kompetisi',
    summary: 'Departemen Manajemen Bisnis ITS berhasil meraih Juara 1 Best Internationalisation Endeavour, Juara 1 Peserta Pembelajaran Luar Kampus, dan Juara 2 Kesiapan Kerja Lulusan pada Rektor Awards ITS.',
    isPinned: true,
    linkText: 'Lihat Prestasi Mahasiswa & Departemen',
    linkUrl: '/wall-of-fame'
  },
  {
    id: 'ann-02',
    title: 'Akreditasi Internasional FIBAA (2025–2030) Program Sarjana Manajemen Bisnis',
    date: '25 Januari 2026',
    category: 'Akademik',
    summary: 'Program Studi S1 Manajemen Bisnis ITS resmi memegang sertifikasi akreditasi internasional FIBAA dengan masa berlaku 2025–2030, melengkapi akreditasi nasional berpredikat Unggul.',
    isPinned: true,
    linkText: 'Informasi Akreditasi Departemen',
    linkUrl: '/about'
  },
  {
    id: 'ann-03',
    title: 'Penerimaan Mahasiswa Baru S1 Bisnis Digital & S1 Manajemen Bisnis ITS',
    date: '15 Januari 2026',
    category: 'Akademik',
    summary: 'Informasi kuota dan seleksi nasional (SNBP, SNBT, dan Seleksi Mandiri ITS) untuk Program Studi S1 Manajemen Bisnis (S.M.) dan S1 Bisnis Digital (S.Bns.) tahun akademik mendatang.',
    linkText: 'Informasi Program Studi',
    linkUrl: '/about'
  },
  {
    id: 'ann-04',
    title: 'Kegiatan Riset & Praktikum Laboratorium ESME dan BAS Semester Genap',
    date: '08 Januari 2026',
    category: 'Organisasi',
    summary: 'Laboratorium Entrepreneurship & SME Development (ESME) dan Business Analytics & Strategy (BAS) membuka pendaftaran kegiatan asisten laboratorium dan riset terapan mahasiswa.',
    linkText: 'Detail Laboratorium',
    linkUrl: '/about'
  }
];
