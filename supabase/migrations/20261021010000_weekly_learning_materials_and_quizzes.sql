-- ==============================================================================
-- Migration: Weekly Learning Materials, Downloadable Attachments, and Quizzes
-- Departemen Manajemen Bisnis ITS
-- ==============================================================================

-- 1. Alter course_weekly_topics to support description, learning objectives, and status
ALTER TABLE public.course_weekly_topics 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS learning_objectives TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- 2. Create weekly_materials
CREATE TABLE IF NOT EXISTS public.weekly_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  weekly_topic_id UUID NOT NULL REFERENCES public.course_weekly_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_format VARCHAR(50) DEFAULT 'markdown' NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  status VARCHAR(20) DEFAULT 'published' NOT NULL,
  is_published BOOLEAN DEFAULT true NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Alter course_attachments to link with weekly topics & materials
ALTER TABLE public.course_attachments
  ADD COLUMN IF NOT EXISTS weekly_topic_id UUID REFERENCES public.course_weekly_topics(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS material_id UUID REFERENCES public.weekly_materials(id) ON DELETE CASCADE;

-- 4. Create course_quizzes
CREATE TABLE IF NOT EXISTS public.course_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  weekly_topic_id UUID NOT NULL REFERENCES public.course_weekly_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'published' NOT NULL,
  is_published BOOLEAN DEFAULT true NOT NULL,
  time_limit_minutes INTEGER,
  passing_score NUMERIC(5, 2) DEFAULT 70.00 NOT NULL,
  max_attempts INTEGER DEFAULT 3,
  shuffle_questions BOOLEAN DEFAULT false NOT NULL,
  shuffle_options BOOLEAN DEFAULT false NOT NULL,
  show_correct_answers_after_submission BOOLEAN DEFAULT true NOT NULL,
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Create quiz_questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.course_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(30) DEFAULT 'single_choice' NOT NULL,
  points NUMERIC(5, 2) DEFAULT 10.00 NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Create quiz_question_options
CREATE TABLE IF NOT EXISTS public.quiz_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL
);

-- 7. Create quiz_attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.course_quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  student_identifier TEXT,
  attempt_number INTEGER DEFAULT 1 NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  submitted_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'in_progress' NOT NULL,
  score NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
  max_score NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
  percentage NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
  is_passed BOOLEAN DEFAULT false NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Create quiz_attempt_responses
CREATE TABLE IF NOT EXISTS public.quiz_attempt_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_option_ids TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  is_correct BOOLEAN DEFAULT false NOT NULL,
  awarded_points NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_weekly_materials_topic ON public.weekly_materials(weekly_topic_id);
CREATE INDEX IF NOT EXISTS idx_weekly_materials_course ON public.weekly_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_course_quizzes_topic ON public.course_quizzes(weekly_topic_id);
CREATE INDEX IF NOT EXISTS idx_course_quizzes_course ON public.course_quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_question_options_q ON public.quiz_question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_responses_att ON public.quiz_attempt_responses(attempt_id);

-- RLS
ALTER TABLE public.weekly_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published materials" ON public.weekly_materials FOR SELECT TO public USING (is_published = true OR public.is_admin());
CREATE POLICY "Admins can manage materials" ON public.weekly_materials FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.course_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published quizzes" ON public.course_quizzes FOR SELECT TO public USING (is_published = true OR public.is_admin());
CREATE POLICY "Admins can manage quizzes" ON public.course_quizzes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view quiz questions" ON public.quiz_questions FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage quiz questions" ON public.quiz_questions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.quiz_question_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view quiz options" ON public.quiz_question_options FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage quiz options" ON public.quiz_question_options FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students and admins can view attempts" ON public.quiz_attempts FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert attempts" ON public.quiz_attempts FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can manage attempts" ON public.quiz_attempts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.quiz_attempt_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students and admins can view responses" ON public.quiz_attempt_responses FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert responses" ON public.quiz_attempt_responses FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can manage responses" ON public.quiz_attempt_responses FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
