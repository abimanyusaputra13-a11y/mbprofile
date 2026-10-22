import { NavRoute } from '@/types';

export const PRIMARY_NAV_ROUTES: NavRoute[] = [
  { name: 'Home', path: '/', description: 'Beranda & Kilas Departemen Manajemen Bisnis ITS' },
  { name: 'Mata Kuliah', path: '/courses', description: 'Silabus Resmi & Modul Mingguan Interaktif' },
  { name: 'Materi dan Soal', path: '/materi-soal', description: 'Kompilasi Bahan Belajar & Dokumen Arsip' },
  { name: 'Daftar Dosen', path: '/dosen', description: 'Pimpinan Departemen, Dosen, & Tenaga Kependidikan' },
  { name: 'Who Are We?', path: '/about', description: 'Profil, Visi Misi, Sejarah, & Laboratorium' },
  { name: 'Wall of Fame', path: '/wall-of-fame', description: 'Apresiasi Prestasi Mahasiswa Manajemen Bisnis' },
];
