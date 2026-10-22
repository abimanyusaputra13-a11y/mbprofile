import { Achievement } from '@/types';

export interface DepartmentAward {
  id: string;
  title: string;
  place: string;
  context: string;
  announcementDate: string;
  source: string;
}

export const departmentAchievements: DepartmentAward[] = [
  {
    id: 'dept-award-01',
    title: 'Best Internationalisation Endeavour',
    place: 'Juara 1 (1st Place)',
    context: 'Upaya internasionalisasi departemen, kemitraan global, dan akreditasi internasional.',
    announcementDate: '10 Februari 2026',
    source: 'Rektor Awards ITS 2025'
  },
  {
    id: 'dept-award-02',
    title: 'Number of Students Participating in Off-Campus Learning',
    place: 'Juara 1 (1st Place)',
    context: 'Partisipasi mahasiswa dalam kegiatan pembelajaran luar kampus (experiential learning & MBKM).',
    announcementDate: '10 Februari 2026',
    source: 'Rektor Awards ITS 2025'
  },
  {
    id: 'dept-award-03',
    title: 'Graduate Employment, Further Study, or Entrepreneurship',
    place: 'Juara 2 (2nd Place)',
    context: 'Persentase lulusan sarjana yang langsung bekerja, melanjutkan studi, atau berwirausaha.',
    announcementDate: '10 Februari 2026',
    source: 'Rektor Awards ITS 2025'
  }
];

export const mockAchievements: Achievement[] = [
  // --- 2026 ---
  {
    id: 'ach-2026-01',
    title: 'Business Case Competition at INCEPTION 2026 SPE UNDIP SC',
    category: 'Kompetisi',
    level: 'Nasional',
    year: 2026,
    award: '1st Runner-Up',
    members: ['Danish Athala Rashad'],
    eventOrganizer: 'INCEPTION 2026 SPE UNDIP SC',
    description: 'Meraih predikat 1st Runner-Up pada ajang Business Case Competition di INCEPTION 2026 SPE UNDIP SC.',
    badgeVariant: 'blue'
  },
  {
    id: 'ach-2026-02',
    title: 'English Speech Competition at Voice Fest 2026',
    category: 'Kompetisi',
    level: 'Nasional',
    year: 2026,
    award: '2nd Place',
    members: ['Aulia Nadya Azizah'],
    eventOrganizer: 'Voice Fest 2026',
    description: 'Meraih peringkat ke-2 (2nd Place) pada kompetisi English Speech Competition di ajang Voice Fest 2026.',
    badgeVariant: 'gold'
  },

  // --- 2025 ---
  {
    id: 'ach-2025-01',
    title: 'Southeast Asia Business Case Competition',
    category: 'Kompetisi',
    level: 'Internasional',
    year: 2025,
    award: '2nd Winner',
    members: ['Charissa Salsabilla Noor'],
    eventOrganizer: 'Share ITB × NTU Product',
    description: 'Meraih gelar 2nd Winner pada Southeast Asia Business Case Competition yang diselenggarakan oleh Share ITB × NTU Product.',
    badgeVariant: 'blue'
  },
  {
    id: 'ach-2025-02',
    title: 'UMi Youthpreneur Grand Final',
    category: 'Proyek & Startup',
    level: 'Nasional',
    year: 2025,
    award: '1st Place',
    members: ['Rachel Putricia'],
    eventOrganizer: 'UMi Youthpreneur Grand Final',
    description: 'Meraih Juara 1 (1st Place) pada putaran Grand Final ajang kewirausahaan muda nasional UMi Youthpreneur.',
    badgeVariant: 'gold'
  },
  {
    id: 'ach-2025-03',
    title: 'Unilever Future Leaders\' League',
    category: 'Kompetisi',
    level: 'Nasional',
    year: 2025,
    award: 'Bronze Medalist',
    members: ['Sherina Prayogo'],
    eventOrganizer: 'Unilever Future Leaders\' League',
    description: 'Meraih penghargaan Bronze Medalist pada kompetisi kepemimpinan dan studi kasus bisnis Unilever Future Leaders\' League.',
    badgeVariant: 'purple'
  },
  {
    id: 'ach-2025-04',
    title: 'PKM-VGK Presentation category at PIMNAS 38',
    category: 'Riset & Publikasi',
    level: 'Nasional',
    year: 2025,
    award: 'Silver Medal',
    members: ['Alief Dipo Nusantara Siswanto'],
    eventOrganizer: 'Pusat Prestasi Nasional (Puspresnas) — PIMNAS 38',
    description: 'Meraih medali perak (Silver Medal) pada kategori Presentasi PKM-VGK di ajang Pekan Ilmiah Mahasiswa Nasional (PIMNAS) ke-38.',
    badgeVariant: 'blue'
  },

  // --- 2024 ---
  {
    id: 'ach-2024-01',
    title: 'KMI Award in Growing Digital Business Category',
    category: 'Proyek & Startup',
    level: 'Nasional',
    year: 2024,
    award: 'Gold Award',
    members: ['M. Ariiq Alvino S.'],
    eventOrganizer: 'Kewirausahaan Mahasiswa Indonesia (KMI) Expo Kemendikbudristek',
    description: 'Meraih medali emas (Gold Award) pada ajang KMI Award untuk kategori Bisnis Digital yang Sedang Berkembang.',
    badgeVariant: 'gold'
  },
  {
    id: 'ach-2024-02',
    title: 'International Youth Business Competition',
    category: 'Kompetisi',
    level: 'Internasional',
    year: 2024,
    award: 'Silver Medal',
    members: ['Andika Rivaldi Perkasa'],
    eventOrganizer: 'International Youth Business Competition',
    description: 'Meraih medali perak (Silver Medal) pada kompetisi bisnis pemuda tingkat internasional International Youth Business Competition.',
    badgeVariant: 'blue'
  }
];

export const ACHIEVEMENT_CATEGORIES_LIST: Achievement['category'][] = [
  'Kompetisi',
  'Proyek & Startup',
  'Riset & Publikasi',
  'Beasiswa'
];

export const ACHIEVEMENT_YEARS_LIST = ['Semua Tahun', '2026', '2025', '2024'];
