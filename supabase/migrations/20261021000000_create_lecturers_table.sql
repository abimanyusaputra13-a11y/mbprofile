-- ==============================================================================
-- Migration: Add Lecturers Directory & Storage Bucket
-- Departemen Manajemen Bisnis ITS
-- ==============================================================================

-- 1. Create Lecturers Table
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

-- 2. Indexes and Constraints
-- Nullable unique constraint on NIP ensures non-null NIPs are unique without blocking multiple nulls
CREATE UNIQUE INDEX IF NOT EXISTS idx_lecturers_nip_unique ON public.lecturers(nip) WHERE nip IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lecturers_normalized_name ON public.lecturers(normalized_name);
CREATE INDEX IF NOT EXISTS idx_lecturers_research_interests ON public.lecturers USING GIN(research_interests);

-- 3. Auto-update updated_at trigger
DROP TRIGGER IF EXISTS trigger_set_lecturers_updated_at ON public.lecturers;
CREATE TRIGGER trigger_set_lecturers_updated_at
  BEFORE UPDATE ON public.lecturers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 4. Row Level Security (RLS)
ALTER TABLE public.lecturers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lecturers' AND policyname = 'Public can view lecturers'
  ) THEN
    CREATE POLICY "Public can view lecturers"
      ON public.lecturers
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lecturers' AND policyname = 'Admins can manage lecturers'
  ) THEN
    CREATE POLICY "Admins can manage lecturers"
      ON public.lecturers
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 5. Storage Bucket: lecturer-photos (Public bucket for profile portraits)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lecturer-photos',
  'lecturer-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view lecturer photos'
  ) THEN
    CREATE POLICY "Public can view lecturer photos"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'lecturer-photos');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can manage lecturer photos'
  ) THEN
    CREATE POLICY "Admins can manage lecturer photos"
      ON storage.objects
      FOR ALL
      TO authenticated
      USING (bucket_id = 'lecturer-photos' AND public.is_admin())
      WITH CHECK (bucket_id = 'lecturer-photos' AND public.is_admin());
  END IF;
END $$;
