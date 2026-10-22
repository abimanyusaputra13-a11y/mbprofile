export interface Course {
  id: string;
  code: string | null;
  name: string;
  study_program: 'S1 Manajemen Bisnis' | 'S1 Bisnis Digital' | string | null;
  semester: number | null;
  credits: number | null;
  academic_year: string | null;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseAssessment {
  id: string;
  course_id: string;
  component_name: string;
  percentage: number | null;
  description: string | null;
  display_order: number;
  created_at?: string;
}

export interface CourseWeeklyTopic {
  id: string;
  course_id: string;
  week_number: string; // Supports '1' or 'Weeks 1–2'
  topic_title: string;
  subtopics?: string | null;
  description?: string | null;
  learning_objectives?: string | null;
  display_order: number;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CourseSummary {
  id: string;
  course_id: string;
  title: string;
  content: string;
  content_format: 'markdown' | 'plain';
  author: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseReference {
  id: string;
  course_id: string;
  title: string;
  author: string;
  publication_year: string | null;
  publisher: string | null;
  url: string | null;
  is_primary: boolean;
  created_at?: string;
}

export interface CourseAttachment {
  id: string;
  course_id: string;
  weekly_topic_id?: string | null;
  material_id?: string | null;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number;
  file_category: 'Slide Dosen' | 'Silabus / RPS' | 'Modul Praktikum' | 'Latihan Soal' | 'Template Tugas' | 'Dokumen' | string;
  is_published: boolean;
  download_count: number;
  created_at: string;
  signedUrl?: string; // Optional temporary URL populated for preview/download
}

// ==============================================================================
// Weekly Learning Materials & Quizzes
// ==============================================================================

export interface WeeklyMaterial {
  id: string;
  course_id: string;
  weekly_topic_id: string;
  title: string;
  content: string;
  content_format: 'markdown' | 'plain';
  sort_order: number;
  status: 'draft' | 'published';
  is_published: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false';

export interface QuizQuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct?: boolean; // Stripped in student view before submission!
  display_order: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: QuestionType;
  points: number;
  display_order: number;
  explanation?: string | null;
  created_at: string;
  options: QuizQuestionOption[];
}

export interface CourseQuiz {
  id: string;
  course_id: string;
  weekly_topic_id: string;
  title: string;
  description?: string | null;
  status: 'draft' | 'published';
  is_published: boolean;
  time_limit_minutes?: number | null;
  passing_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_correct_answers_after_submission: boolean;
  available_from?: string | null;
  available_until?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  questions?: QuizQuestion[];
  question_count?: number;
  total_points?: number;
  course?: { id: string; name: string; code?: string };
  weekly_topic?: { id: string; week_number: string; topic_title: string };
}

export interface QuizAttemptResponse {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_ids: string[];
  is_correct: boolean;
  awarded_points: number;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id?: string | null;
  student_name: string;
  student_identifier?: string | null;
  attempt_number: number;
  started_at: string;
  submitted_at?: string | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  score: number;
  max_score: number;
  percentage: number;
  is_passed: boolean;
  feedback?: string | null;
  created_at: string;
  responses?: QuizAttemptResponse[];
}

export interface WeeklyTopicDetail extends CourseWeeklyTopic {
  materials: WeeklyMaterial[];
  attachments: CourseAttachment[];
  quizzes: CourseQuiz[];
}

export interface CourseWithDetails extends Course {
  assessments: CourseAssessment[];
  weekly_topics: CourseWeeklyTopic[];
  summaries: CourseSummary[];
  references: CourseReference[];
  attachments: CourseAttachment[];
  weekly_details?: WeeklyTopicDetail[];
}
