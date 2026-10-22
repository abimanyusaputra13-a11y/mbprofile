-- ==============================================================================
-- Supabase Seed Data: Initial Courses (Departemen Manajemen Bisnis ITS)
-- ==============================================================================
-- Description:
-- Inserts the 4 initial course records as DRAFTS (is_published = false).
-- Preserves exact supplied codes, curriculum, and assessment weights.
-- Does not fabricate missing codes, credits, or descriptions.
-- ==============================================================================

DO $$
DECLARE
  v_course_1_id UUID := gen_random_uuid();
  v_course_2_id UUID := gen_random_uuid();
  v_course_3_id UUID := gen_random_uuid();
  v_course_4_id UUID := gen_random_uuid();
BEGIN

  -- 1. Ekonomi Mikro (Identitas kode/sks belum terverifikasi -> simpan sebagai draf tanpa rekayasa)
  INSERT INTO public.courses (id, code, name, study_program, semester, credits, academic_year, description, is_published)
  VALUES (
    v_course_1_id,
    NULL, -- Kode belum terverifikasi, dibiarkan NULL sesuai instruksi
    'Ekonomi Mikro',
    'S1 Manajemen Bisnis',
    NULL,
    NULL,
    NULL,
    'Mata kuliah pengantar teori ekonomi mikro, perilaku konsumen, mekanisme pasar, dan analisis biaya produksi.',
    false -- DRAFT
  ) ON CONFLICT DO NOTHING;

  -- 2. Pengantar Manajemen Bisnis (DB234101)
  INSERT INTO public.courses (id, code, name, study_program, semester, credits, academic_year, description, is_published)
  VALUES (
    v_course_2_id,
    'DB234101',
    'Pengantar Manajemen Bisnis',
    'S1 Bisnis Digital',
    1,
    3,
    'Kurikulum 2023',
    'Fondasi prinsip-prinsip manajemen bisnis modern, fungsi manajerial, etika bisnis, dan ekosistem perusahaan digital.',
    false -- DRAFT
  ) ON CONFLICT DO NOTHING;

  -- Contoh komponen penilaian dengan bobot asli yang tidak dinormalisasi secara paksa
  INSERT INTO public.course_assessments (course_id, component_name, percentage, display_order)
  VALUES 
    (v_course_2_id, 'Ujian Tengah Semester (UTS)', 35.00, 1),
    (v_course_2_id, 'Ujian Akhir Semester (UAS)', 35.00, 2),
    (v_course_2_id, 'Tugas Analisis Studi Kasus', 15.00, 3) -- Total 85% preserved
  ON CONFLICT DO NOTHING;

  -- 3. Pemodelan Data (Kurikulum 2023)
  INSERT INTO public.courses (id, code, name, study_program, semester, credits, academic_year, description, is_published)
  VALUES (
    v_course_3_id,
    NULL,
    'Pemodelan Data',
    'S1 Bisnis Digital',
    3,
    3,
    'Kurikulum 2023',
    'Pemodelan data konseptual, perancangan basis data relasional, dan integrasi analitika data untuk kebutuhan strategi bisnis.',
    false -- DRAFT
  ) ON CONFLICT DO NOTHING;

  -- 4. Akuntansi Finansial (DB234206)
  INSERT INTO public.courses (id, code, name, study_program, semester, credits, academic_year, description, is_published)
  VALUES (
    v_course_4_id,
    'DB234206',
    'Akuntansi Finansial',
    'S1 Bisnis Digital',
    2,
    3,
    'Kurikulum 2023',
    'Prinsip akuntansi keuangan, pencatatan transaksi, penyusunan laporan laba rugi, neraca keuangan, dan arus kas.',
    false -- DRAFT
  ) ON CONFLICT DO NOTHING;

  -- Contoh komponen penilaian (Preserving supplied weights)
  INSERT INTO public.course_assessments (course_id, component_name, percentage, display_order)
  VALUES 
    (v_course_4_id, 'Ujian Tengah Semester (UTS)', 40.00, 1),
    (v_course_4_id, 'Ujian Akhir Semester (UAS)', 40.00, 2),
    (v_course_4_id, 'Praktikum & Siklus Akuntansi', 25.00, 3) -- Total 105% preserved
  ON CONFLICT DO NOTHING;

END $$;
