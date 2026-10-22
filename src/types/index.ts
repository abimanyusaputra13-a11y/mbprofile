export type ResourceType =
  | 'Catatan Kuliah'
  | 'Slide Dosen'
  | 'Soal UTS'
  | 'Soal UAS'
  | 'Panduan Praktikum'
  | 'Tugas Proyek';

export type FileFormat = 'PDF' | 'ZIP' | 'IPYNB' | 'DOCX' | 'XLSX';

export interface Resource {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  semester: number;
  type: ResourceType;
  academicYear: string;
  fileFormat: FileFormat;
  fileSize: string;
  uploadedAt: string;
  downloadCount: number;
  author: string;
  description: string;
  sampleUrl: string;
  tags: string[];
  courseId?: string;
  weeklyTopicId?: string;
  weekNumber?: string;
  attachmentId?: string;
  summaryContent?: string;
  total_views?: number;
  timeframe_views?: number;
  is_published?: boolean;
}

export type TimeframeFilter = 'all' | 'month' | 'week' | 'today';


export type AcademicRank = 'Pimpinan Departemen' | 'Dosen Pengajar' | 'Tenaga Kependidikan' | string;

export interface Lecturer {
  id: string;
  name: string;
  normalized_name?: string;
  academicTitle?: string;
  nip?: string | null;
  position?: string | null;
  laboratory?: string;
  rank?: AcademicRank;
  specializations?: string[];
  research_interests?: string[];
  photo_source_url?: string | null;
  photo_storage_path?: string | null;
  photo_url?: string | null;
  google_scholar_url?: string | null;
  scopus_url?: string | null;
  detail_page_url?: string | null;
  source_url?: string;
  last_synced_at?: string | null;
  email?: string;
  office?: string;
  googleScholarUrl?: string;
  scopusUrl?: string;
  avatarUrl?: string;
  bio?: string;
  courses?: string[];
  recentResearch?: string[];
  education?: string[];
  created_at?: string;
  updated_at?: string;
}

export type AchievementCategory =
  | 'Kompetisi'
  | 'Beasiswa'
  | 'Riset & Publikasi'
  | 'Proyek & Startup';

export type AchievementLevel = 'Internasional' | 'Nasional' | 'Regional';

export interface Achievement {
  id: string;
  title: string;
  category: AchievementCategory;
  level: AchievementLevel;
  year: number;
  award: string;
  teamName?: string;
  members: string[];
  advisor?: string;
  description: string;
  eventOrganizer: string;
  badgeVariant?: 'gold' | 'blue' | 'purple' | 'green';
}

export type DocumentCategory =
  | 'Laporan Pertanggungjawaban (LPJ)'
  | 'Panduan Akademik & Kurikulum'
  | 'Laporan Akreditasi'
  | 'Rencana Strategis (Renstra)'
  | 'SOP & Kemahasiswaan';

export interface DocumentReport {
  id: string;
  documentCode: string;
  title: string;
  category: DocumentCategory;
  year: number;
  issuingBody: string;
  publishDate: string;
  fileFormat: FileFormat;
  fileSize: string;
  description: string;
  status: 'Resmi Publik' | 'Arsip Terverifikasi';
  sampleUrl: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  category: 'Akademik' | 'Kompetisi' | 'Organisasi' | 'Beasiswa' | 'Kegiatan' | string;
  summary: string;
  content?: string | null;
  eventDate?: string;
  isPinned?: boolean;
  linkText?: string | null;
  linkUrl?: string | null;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NavRoute {
  name: string;
  path: string;
  description?: string;
}
