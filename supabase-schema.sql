-- ==============================================================================
-- Supabase Schema: Course Content Management (Departemen Manajemen Bisnis ITS)
-- ==============================================================================
-- Description:
-- Production-ready schema for owner-only course management with Row Level Security (RLS).
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor).
-- ==============================================================================

-- 1. Enable UUID Extension (standard in Postgres)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. Administrator Authorization Table
-- ==============================================================================
-- Only explicitly approved user IDs can perform administrative operations.
-- Regular authenticated users cannot grant themselves admin status.
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Helper security definer function to check if the current user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin_users list"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Only existing admins can modify admin_users"
  ON public.admin_users
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 3. Core Courses Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(30),                         -- Nullable when unknown (e.g. initial draft)
  name VARCHAR(255) NOT NULL,
  study_program VARCHAR(100),               -- Nullable ('S1 Manajemen Bisnis' | 'S1 Bisnis Digital')
  semester SMALLINT CHECK (semester BETWEEN 1 AND 8),
  credits SMALLINT CHECK (credits > 0),     -- SKS
  academic_year VARCHAR(50),                -- e.g. 'Kurikulum 2023' or '2025/2026'
  description TEXT,
  is_published BOOLEAN DEFAULT false NOT NULL, -- Draft by default
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_code ON public.courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_semester ON public.courses(semester);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_courses_updated_at ON public.courses;
CREATE TRIGGER trigger_set_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Public can view only published courses
CREATE POLICY "Public can view published courses"
  ON public.courses
  FOR SELECT
  TO public
  USING (is_published = true OR public.is_admin());

-- Only admins can create, update, or delete courses
CREATE POLICY "Admins can manage courses"
  ON public.courses
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 4. Course Assessment Components (Komponen Penilaian)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.course_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  component_name VARCHAR(150) NOT NULL,
  percentage NUMERIC(5, 2),                 -- Nullable if unknown; preserves exact weights (e.g. 85%, 105%)
  description TEXT,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_course_assessments_course_id ON public.course_assessments(course_id);

ALTER TABLE public.course_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view assessments of published courses"
  ON public.course_assessments
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_assessments.course_id AND (c.is_published = true OR public.is_admin())
    )
  );

CREATE POLICY "Admins can manage course assessments"
  ON public.course_assessments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 5. Course Weekly Topics / Syllabus (Jadwal & Topik Mingguan / RPS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.course_weekly_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  week_number VARCHAR(50) NOT NULL,         -- Supports single week '1' or combined 'Weeks 1–2'
  topic_title VARCHAR(255) NOT NULL,
  subtopics TEXT,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_course_weekly_topics_course_id ON public.course_weekly_topics(course_id);

ALTER TABLE public.course_weekly_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view weekly topics of published courses"
  ON public.course_weekly_topics
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_weekly_topics.course_id AND (c.is_published = true OR public.is_admin())
    )
  );

CREATE POLICY "Admins can manage course weekly topics"
  ON public.course_weekly_topics
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 6. Course Summaries (Rangkuman & Catatan Materi Kuliah)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.course_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_format VARCHAR(50) DEFAULT 'markdown' NOT NULL, -- 'markdown' | 'plain'
  author VARCHAR(150),
  is_published BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_course_summaries_course_id ON public.course_summaries(course_id);

DROP TRIGGER IF EXISTS trigger_set_course_summaries_updated_at ON public.course_summaries;
CREATE TRIGGER trigger_set_course_summaries_updated_at
  BEFORE UPDATE ON public.course_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_current_timestamp_updated_at();

ALTER TABLE public.course_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published summaries of published courses"
  ON public.course_summaries
  FOR SELECT
  TO public
  USING (
    (is_published = true AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_summaries.course_id AND c.is_published = true
    )) OR public.is_admin()
  );

CREATE POLICY "Admins can manage course summaries"
  ON public.course_summaries
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 7. Course References (Buku Teks & Rujukan)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.course_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  author VARCHAR(255) NOT NULL,
  publication_year VARCHAR(20),
  publisher VARCHAR(200),
  url VARCHAR(500),
  is_primary BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_course_references_course_id ON public.course_references(course_id);

ALTER TABLE public.course_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view references of published courses"
  ON public.course_references
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_references.course_id AND (c.is_published = true OR public.is_admin())
    )
  );

CREATE POLICY "Admins can manage course references"
  ON public.course_references
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 8. Course Attachments (Berkas Pendukung Terunggah)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.course_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,       -- Path in private bucket 'course-attachments'
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  file_category VARCHAR(50) DEFAULT 'Dokumen' NOT NULL, -- 'Slide Dosen', 'Silabus / RPS', 'Modul Praktikum', 'Latihan Soal', 'Template Tugas', 'Dokumen'
  is_published BOOLEAN DEFAULT true NOT NULL,
  download_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_course_attachments_course_id ON public.course_attachments(course_id);

ALTER TABLE public.course_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published attachments of published courses"
  ON public.course_attachments
  FOR SELECT
  TO public
  USING (
    (is_published = true AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_attachments.course_id AND c.is_published = true
    )) OR public.is_admin()
  );

CREATE POLICY "Admins can manage course attachments"
  ON public.course_attachments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 9. Private Storage Bucket Setup: course-attachments
-- ==============================================================================
-- Note: Create the bucket if it doesn't already exist.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-attachments',
  'course-attachments',
  false, -- PRIVATE BUCKET: access via signed URLs generated by server for authorized users
  26214400, -- 25 MB max in bytes (25 * 1024 * 1024)
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/webp'
  ];

-- Storage RLS:
-- 1. Read access: Only through server-generated signed URLs or admin direct read
CREATE POLICY "Admin full access to course-attachments bucket"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'course-attachments' AND public.is_admin())
  WITH CHECK (bucket_id = 'course-attachments' AND public.is_admin());

-- ==============================================================================
-- 10. Lecturers Directory Table & lecturer-photos Storage Bucket
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lecturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  nip TEXT,
  position TEXT,
  photo_source_url TEXT,
  photo_storage_path TEXT,
  research_interests TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  google_scholar_url TEXT,
  scopus_url TEXT,
  detail_page_url TEXT,
  source_url TEXT NOT NULL DEFAULT 'https://www.its.ac.id/mb/dosen-staff/daftar-dosen/',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lecturers_nip_unique ON public.lecturers(nip) WHERE nip IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lecturers_normalized_name ON public.lecturers(normalized_name);
CREATE INDEX IF NOT EXISTS idx_lecturers_research_interests ON public.lecturers USING GIN(research_interests);

DROP TRIGGER IF EXISTS trigger_set_lecturers_updated_at ON public.lecturers;
CREATE TRIGGER trigger_set_lecturers_updated_at
  BEFORE UPDATE ON public.lecturers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_current_timestamp_updated_at();

ALTER TABLE public.lecturers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view lecturers"
  ON public.lecturers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage lecturers"
  ON public.lecturers
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Storage Bucket: lecturer-photos (Public bucket for profile portraits)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lecturer-photos',
  'lecturer-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

CREATE POLICY "Public can view lecturer photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'lecturer-photos');

CREATE POLICY "Admins can manage lecturer photos"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'lecturer-photos' AND public.is_admin())
  WITH CHECK (bucket_id = 'lecturer-photos' AND public.is_admin());

