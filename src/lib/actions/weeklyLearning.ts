'use server';

import { connection } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { verifyAdminStatus } from '@/lib/supabase/auth';
import {
  WeeklyMaterial,
  CourseQuiz,
  QuizQuestion,
  QuizQuestionOption,
  QuizAttempt,
  QuizAttemptResponse,
  CourseWeeklyTopic,
  CourseAttachment,
  Course,
  QuestionType,
} from '@/types/course';
import { revalidatePath } from 'next/cache';

// ==============================================================================
// 1. Weekly Topic & Learning Data Fetchers
// ==============================================================================

export interface WeeklyLearningPageData {
  course: Course;
  allWeeklyTopics: CourseWeeklyTopic[];
  currentTopic: CourseWeeklyTopic;
  materials: WeeklyMaterial[];
  attachments: CourseAttachment[];
  quizzes: CourseQuiz[];
  isAdmin: boolean;
  error?: string;
}

export async function getWeeklyTopicLearningData(
  courseId: string,
  topicId: string
): Promise<WeeklyLearningPageData | { error: string }> {
  await connection();
  const supabase = await createClient();
  if (!supabase) return { error: 'Database unconfigured' };

  const auth = await verifyAdminStatus();
  const isAdmin = auth.isAdmin;

  // 1. Fetch Course
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (courseError || !course) {
    return { error: 'Mata kuliah tidak ditemukan.' };
  }

  // If course is not published and user is not admin, deny access
  if (!course.is_published && !isAdmin) {
    return { error: 'Mata kuliah ini belum dipublikasikan.' };
  }

  // 2. Fetch All Weekly Topics for this course
  let topicsQuery = supabase
    .from('course_weekly_topics')
    .select('*')
    .eq('course_id', courseId)
    .order('display_order', { ascending: true });

  if (!isAdmin) {
    topicsQuery = topicsQuery.eq('is_published', true);
  }

  const { data: allTopics, error: topicsError } = await topicsQuery;
  if (topicsError) {
    return { error: topicsError.message };
  }

  // Find Current Topic
  const currentTopic = (allTopics || []).find((t) => t.id === topicId);
  if (!currentTopic) {
    return { error: 'Topik mingguan tidak ditemukan atau belum dipublikasikan.' };
  }

  // 3. Fetch Materials for Current Topic
  let materialsQuery = supabase
    .from('weekly_materials')
    .select('*')
    .eq('weekly_topic_id', topicId)
    .order('sort_order', { ascending: true });

  if (!isAdmin) {
    materialsQuery = materialsQuery.eq('is_published', true);
  }

  const { data: materials, error: materialsError } = await materialsQuery;
  if (materialsError) {
    return { error: materialsError.message };
  }

  // 4. Fetch Attachments for Current Topic
  let attachmentsQuery = supabase
    .from('course_attachments')
    .select('*')
    .eq('weekly_topic_id', topicId)
    .order('created_at', { ascending: false });

  if (!isAdmin) {
    attachmentsQuery = attachmentsQuery.eq('is_published', true);
  }

  const { data: attachmentsRaw, error: attError } = await attachmentsQuery;
  if (attError) {
    return { error: attError.message };
  }

  // Generate signed URLs for attachments so students can download directly
  const adminClient = createAdminClient();
  const storageClient = adminClient || supabase;

  const attachments: CourseAttachment[] = await Promise.all(
    (attachmentsRaw || []).map(async (att) => {
      const { data: signedData } = await storageClient.storage
        .from('course-attachments')
        .createSignedUrl(att.storage_path, 3600);
      return {
        ...att,
        signedUrl: signedData?.signedUrl || undefined,
      };
    })
  );

  // 5. Fetch Quizzes for Current Topic
  let quizzesQuery = supabase
    .from('course_quizzes')
    .select('*, quiz_questions(id, points)')
    .eq('weekly_topic_id', topicId)
    .order('created_at', { ascending: true });

  if (!isAdmin) {
    quizzesQuery = quizzesQuery.eq('is_published', true);
  }

  const { data: quizzesRaw, error: quizError } = await quizzesQuery;
  if (quizError) {
    return { error: quizError.message };
  }

  const quizzes: CourseQuiz[] = (quizzesRaw || []).map((q) => {
    const qList = (q.quiz_questions as { id: string; points: number }[]) || [];
    const totalPoints = qList.reduce((sum, item) => sum + (Number(item.points) || 0), 0);
    return {
      ...q,
      question_count: qList.length,
      total_points: totalPoints,
      quiz_questions: undefined,
    };
  });

  return {
    course,
    allWeeklyTopics: allTopics || [],
    currentTopic,
    materials: materials || [],
    attachments,
    quizzes,
    isAdmin,
  };
}

// ==============================================================================
// 2. Weekly Material Management (Admin)
// ==============================================================================

export async function saveWeeklyMaterial(data: {
  id?: string;
  course_id: string;
  weekly_topic_id: string;
  title: string;
  content: string;
  content_format?: 'markdown' | 'plain';
  sort_order?: number;
  status?: 'draft' | 'published';
  is_published?: boolean;
}): Promise<{ data?: WeeklyMaterial; error?: string }> {
  await connection();
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { error: auth.error || 'Akses ditolak.' };

  const supabase = await createClient();
  if (!supabase) return { error: 'Database unconfigured' };

  const isPub = data.is_published ?? (data.status === 'published');
  const record = {
    course_id: data.course_id,
    weekly_topic_id: data.weekly_topic_id,
    title: data.title.trim(),
    content: data.content,
    content_format: data.content_format || 'markdown',
    sort_order: data.sort_order ?? 0,
    status: isPub ? 'published' : 'draft',
    is_published: isPub,
    created_by: auth.user?.id || null,
    updated_at: new Date().toISOString(),
  };

  if (data.id) {
    const { data: updated, error } = await supabase
      .from('weekly_materials')
      .update(record)
      .eq('id', data.id)
      .select()
      .single();

    if (error) return { error: error.message };
    revalidatePath(`/courses/${data.course_id}/weeks/${data.weekly_topic_id}`);
    revalidatePath(`/admin/courses/${data.course_id}`);
    return { data: updated };
  } else {
    const { data: inserted, error } = await supabase
      .from('weekly_materials')
      .insert(record)
      .select()
      .single();

    if (error) return { error: error.message };
    revalidatePath(`/courses/${data.course_id}/weeks/${data.weekly_topic_id}`);
    revalidatePath(`/admin/courses/${data.course_id}`);
    return { data: inserted };
  }
}

export async function deleteWeeklyMaterial(
  materialId: string,
  courseId: string,
  topicId: string
): Promise<{ success: boolean; error?: string }> {
  await connection();
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Akses ditolak.' };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  const { error } = await supabase
    .from('weekly_materials')
    .delete()
    .eq('id', materialId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/courses/${courseId}/weeks/${topicId}`);
  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

// ==============================================================================
// 3. Weekly Topic Details Management (Admin)
// ==============================================================================

export async function saveWeeklyTopicExtended(data: {
  id?: string;
  course_id: string;
  week_number: string;
  topic_title: string;
  description?: string | null;
  learning_objectives?: string | null;
  subtopics?: string | null;
  display_order?: number;
  is_published?: boolean;
}): Promise<{ data?: CourseWeeklyTopic; error?: string }> {
  await connection();
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { error: auth.error || 'Akses ditolak.' };

  const supabase = await createClient();
  if (!supabase) return { error: 'Database unconfigured' };

  const record = {
    course_id: data.course_id,
    week_number: data.week_number.trim(),
    topic_title: data.topic_title.trim(),
    description: data.description ? data.description.trim() : null,
    learning_objectives: data.learning_objectives ? data.learning_objectives.trim() : null,
    subtopics: data.subtopics ? data.subtopics.trim() : null,
    display_order: data.display_order ?? 0,
    is_published: data.is_published ?? true,
    updated_at: new Date().toISOString(),
  };

  if (data.id) {
    const { data: updated, error } = await supabase
      .from('course_weekly_topics')
      .update(record)
      .eq('id', data.id)
      .select()
      .single();

    if (error) return { error: error.message };
    revalidatePath(`/courses/${data.course_id}/weeks/${data.id}`);
    revalidatePath(`/admin/courses/${data.course_id}`);
    return { data: updated };
  } else {
    const { data: inserted, error } = await supabase
      .from('course_weekly_topics')
      .insert(record)
      .select()
      .single();

    if (error) return { error: error.message };
    revalidatePath(`/admin/courses/${data.course_id}`);
    return { data: inserted };
  }
}

// ==============================================================================
// 4. Weekly Attachment Upload & Link to Topic (Admin)
// ==============================================================================

export async function uploadWeeklyAttachment(
  courseId: string,
  topicId: string,
  formData: FormData,
  materialId?: string
): Promise<{ data?: CourseAttachment; error?: string }> {
  await connection();
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { error: auth.error || 'Akses ditolak.' };

  const supabase = await createClient();
  if (!supabase) return { error: 'Database unconfigured' };

  const file = formData.get('file') as File;
  const category = (formData.get('category') as string) || 'Slide Dosen';

  if (!file || file.size === 0) {
    return { error: 'Berkas tidak boleh kosong.' };
  }

  if (file.size > 25 * 1024 * 1024) {
    return { error: `Ukuran berkas melebihi batas maksimum 25 MB.` };
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `courses/${courseId}/weeks/${topicId}/${Date.now()}_${sanitizedName}`;

  const adminClient = createAdminClient();
  const storageClient = adminClient || supabase;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await storageClient.storage
    .from('course-attachments')
    .upload(storagePath, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) {
    return { error: `Gagal upload ke storage: ${uploadError.message}` };
  }

  const { data: attachmentRecord, error: dbError } = await supabase
    .from('course_attachments')
    .insert({
      course_id: courseId,
      weekly_topic_id: topicId,
      material_id: materialId || null,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type || 'application/octet-stream',
      file_size_bytes: file.size,
      file_category: category,
      is_published: true,
    })
    .select()
    .single();

  if (dbError) {
    await supabase.storage.from('course-attachments').remove([storagePath]);
    return { error: dbError.message };
  }

  const { data: signedData } = await storageClient.storage
    .from('course-attachments')
    .createSignedUrl(storagePath, 3600);

  revalidatePath(`/courses/${courseId}/weeks/${topicId}`);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/materi-soal');
  return {
    data: {
      ...attachmentRecord,
      signedUrl: signedData?.signedUrl || undefined,
    },
  };
}

export async function updateWeeklyAttachment(
  courseId: string,
  topicId: string,
  attachmentId: string,
  data: {
    file_name: string;
    file_category: string;
    is_published?: boolean;
  },
  newFileFormData?: FormData
): Promise<{ data?: CourseAttachment; error?: string }> {
  await connection();
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { error: auth.error || 'Akses ditolak.' };

  const supabase = await createClient();
  if (!supabase) return { error: 'Database unconfigured' };

  // Fetch current attachment
  const { data: currentAtt, error: fetchErr } = await supabase
    .from('course_attachments')
    .select('*')
    .eq('id', attachmentId)
    .single();

  if (fetchErr || !currentAtt) {
    return { error: 'Berkas tidak ditemukan.' };
  }

  const adminClient = createAdminClient();
  const storageClient = adminClient || supabase;

  let storagePath = currentAtt.storage_path;
  let mimeType = currentAtt.mime_type;
  let fileSizeBytes = currentAtt.file_size_bytes;

  // If a replacement file was uploaded
  if (newFileFormData) {
    const file = newFileFormData.get('file') as File;
    if (file && file.size > 0) {
      if (file.size > 25 * 1024 * 1024) {
        return { error: 'Ukuran berkas pengganti melebihi 25 MB.' };
      }
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const newStoragePath = `courses/${courseId}/weeks/${topicId}/${Date.now()}_${sanitizedName}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await storageClient.storage
        .from('course-attachments')
        .upload(newStoragePath, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        return { error: `Gagal upload berkas pengganti: ${uploadError.message}` };
      }

      // Remove previous file from storage
      await storageClient.storage.from('course-attachments').remove([currentAtt.storage_path]);

      storagePath = newStoragePath;
      mimeType = file.type || 'application/octet-stream';
      fileSizeBytes = file.size;
    }
  }

  const { data: updated, error: updateErr } = await supabase
    .from('course_attachments')
    .update({
      file_name: data.file_name.trim(),
      file_category: data.file_category,
      storage_path: storagePath,
      mime_type: mimeType,
      file_size_bytes: fileSizeBytes,
      is_published: data.is_published ?? currentAtt.is_published,
    })
    .eq('id', attachmentId)
    .select()
    .single();

  if (updateErr) {
    return { error: updateErr.message };
  }

  const { data: signedData } = await storageClient.storage
    .from('course-attachments')
    .createSignedUrl(storagePath, 3600);

  revalidatePath(`/courses/${courseId}/weeks/${topicId}`);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/materi-soal');

  return {
    data: {
      ...updated,
      signedUrl: signedData?.signedUrl || undefined,
    },
  };
}

export async function deleteWeeklyAttachment(
  courseId: string,
  topicId: string,
  attachmentId: string
): Promise<{ success: boolean; error?: string }> {
  await connection();
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Akses ditolak.' };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  const { data: attachment, error: fetchErr } = await supabase
    .from('course_attachments')
    .select('storage_path')
    .eq('id', attachmentId)
    .single();

  if (fetchErr || !attachment) {
    return { success: false, error: 'Berkas tidak ditemukan.' };
  }

  const adminClient = createAdminClient();
  const storageClient = adminClient || supabase;
  await storageClient.storage.from('course-attachments').remove([attachment.storage_path]);

  const { error: delErr } = await supabase
    .from('course_attachments')
    .delete()
    .eq('id', attachmentId);

  if (delErr) return { success: false, error: delErr.message };

  revalidatePath(`/courses/${courseId}/weeks/${topicId}`);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/materi-soal');
  return { success: true };
}

// ==============================================================================
// 5. Quiz Authoring & Management (Admin)
// ==============================================================================

export async function getAdminQuizDetails(quizId: string): Promise<{
  data?: CourseQuiz;
  error?: string;
}> {
  await connection();
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { error: auth.error || 'Akses ditolak.' };

  const supabase = await createClient();
  if (!supabase) return { error: 'Database unconfigured' };

  const { data: quiz, error: quizError } = await supabase
    .from('course_quizzes')
    .select('*, course:courses(id, name, code), weekly_topic:course_weekly_topics(id, week_number, topic_title)')
    .eq('id', quizId)
    .single();

  if (quizError || !quiz) return { error: 'Kuis tidak ditemukan.' };

  // Fetch Questions with Options
  const { data: questions, error: qError } = await supabase
    .from('quiz_questions')
    .select('*, quiz_question_options(*)')
    .eq('quiz_id', quizId)
    .order('display_order', { ascending: true });

  if (qError) return { error: qError.message };

  const formattedQuestions: QuizQuestion[] = (questions || []).map((q) => {
    const opts = (q.quiz_question_options as QuizQuestionOption[]) || [];
    opts.sort((a, b) => a.display_order - b.display_order);
    return {
      ...q,
      options: opts,
      quiz_question_options: undefined,
    };
  });

  const totalPoints = formattedQuestions.reduce((sum, item) => sum + (Number(item.points) || 0), 0);

  return {
    data: {
      ...quiz,
      questions: formattedQuestions,
      question_count: formattedQuestions.length,
      total_points: totalPoints,
    },
  };
}

export async function saveQuizBasic(data: {
  id?: string;
  course_id: string;
  weekly_topic_id: string;
  title: string;
  description?: string | null;
  time_limit_minutes?: number | null;
  passing_score?: number;
  max_attempts?: number;
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  show_correct_answers_after_submission?: boolean;
  is_published?: boolean;
}): Promise<{ data?: CourseQuiz; error?: string }> {
  await connection();
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { error: auth.error || 'Akses ditolak.' };

  const supabase = await createClient();
  if (!supabase) return { error: 'Database unconfigured' };

  const isPub = data.is_published ?? true;
  const record = {
    course_id: data.course_id,
    weekly_topic_id: data.weekly_topic_id,
    title: data.title.trim(),
    description: data.description ? data.description.trim() : null,
    time_limit_minutes: data.time_limit_minutes ? Number(data.time_limit_minutes) : null,
    passing_score: data.passing_score ?? 70.0,
    max_attempts: data.max_attempts ?? 3,
    shuffle_questions: data.shuffle_questions ?? false,
    shuffle_options: data.shuffle_options ?? false,
    show_correct_answers_after_submission: data.show_correct_answers_after_submission ?? true,
    status: isPub ? 'published' : 'draft',
    is_published: isPub,
    created_by: auth.user?.id || null,
    updated_at: new Date().toISOString(),
  };

  if (data.id) {
    const { data: updated, error } = await supabase
      .from('course_quizzes')
      .update(record)
      .eq('id', data.id)
      .select()
      .single();

    if (error) return { error: error.message };
    revalidatePath(`/courses/${data.course_id}/weeks/${data.weekly_topic_id}`);
    revalidatePath(`/admin/courses/${data.course_id}`);
    return { data: updated };
  } else {
    const { data: inserted, error } = await supabase
      .from('course_quizzes')
      .insert(record)
      .select()
      .single();

    if (error) return { error: error.message };
    revalidatePath(`/courses/${data.course_id}/weeks/${data.weekly_topic_id}`);
    revalidatePath(`/admin/courses/${data.course_id}`);
    return { data: inserted };
  }
}

export async function saveQuizQuestion(data: {
  id?: string;
  quiz_id: string;
  question_text: string;
  question_type: QuestionType;
  points: number;
  display_order?: number;
  explanation?: string | null;
  options: {
    id?: string;
    option_text: string;
    is_correct: boolean;
    display_order: number;
  }[];
}): Promise<{ data?: QuizQuestion; error?: string }> {
  await connection();
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { error: auth.error || 'Akses ditolak.' };

  const supabase = await createClient();
  if (!supabase) return { error: 'Database unconfigured' };

  // Validation
  if (!data.question_text.trim()) {
    return { error: 'Teks soal wajib diisi.' };
  }

  if (data.options.length < 2) {
    return { error: 'Soal minimal harus memiliki 2 pilihan jawaban.' };
  }

  const correctCount = data.options.filter((o) => o.is_correct).length;
  if (data.question_type === 'single_choice' && correctCount !== 1) {
    return { error: 'Soal Pilihan Ganda Tunggal harus memiliki tepat 1 jawaban benar.' };
  }
  if (data.question_type === 'true_false' && correctCount !== 1) {
    return { error: 'Soal Benar/Salah harus memiliki tepat 1 jawaban benar.' };
  }
  if (data.question_type === 'multiple_choice' && correctCount < 1) {
    return { error: 'Soal Pilihan Ganda Berganda minimal memiliki 1 jawaban benar.' };
  }

  // 1. Save Question
  let questionId = data.id;
  const qRecord = {
    quiz_id: data.quiz_id,
    question_text: data.question_text.trim(),
    question_type: data.question_type,
    points: data.points > 0 ? data.points : 10,
    display_order: data.display_order ?? 0,
    explanation: data.explanation ? data.explanation.trim() : null,
  };

  if (questionId) {
    const { error: qUpdateError } = await supabase
      .from('quiz_questions')
      .update(qRecord)
      .eq('id', questionId);
    if (qUpdateError) return { error: qUpdateError.message };
  } else {
    const { data: qInserted, error: qInsertError } = await supabase
      .from('quiz_questions')
      .insert(qRecord)
      .select()
      .single();
    if (qInsertError || !qInserted) return { error: qInsertError?.message || 'Gagal menyimpan soal' };
    questionId = qInserted.id;
  }

  // 2. Refresh options (delete old options and re-insert for consistency)
  await supabase.from('quiz_question_options').delete().eq('question_id', questionId);

  const optionsToInsert = data.options.map((opt, idx) => ({
    question_id: questionId!,
    option_text: opt.option_text.trim(),
    is_correct: Boolean(opt.is_correct),
    display_order: opt.display_order ?? idx,
  }));

  const { data: insertedOptions, error: optError } = await supabase
    .from('quiz_question_options')
    .insert(optionsToInsert)
    .select();

  if (optError) return { error: optError.message };

  // Revalidate relevant pages
  const { data: quizMeta } = await supabase
    .from('course_quizzes')
    .select('course_id, weekly_topic_id')
    .eq('id', data.quiz_id)
    .single();

  if (quizMeta) {
    revalidatePath(`/courses/${quizMeta.course_id}/weeks/${quizMeta.weekly_topic_id}`);
    revalidatePath(`/courses/${quizMeta.course_id}/weeks/${quizMeta.weekly_topic_id}/quiz/${data.quiz_id}`);
    revalidatePath(`/admin/courses/${quizMeta.course_id}`);
  }
  revalidatePath(`/admin/quizzes/${data.quiz_id}`);
  revalidatePath('/admin/quizzes');

  return {
    data: {
      id: questionId!,
      quiz_id: data.quiz_id,
      question_text: data.question_text,
      question_type: data.question_type,
      points: data.points,
      display_order: data.display_order ?? 0,
      explanation: data.explanation || null,
      created_at: new Date().toISOString(),
      options: (insertedOptions as QuizQuestionOption[]) || [],
    },
  };
}

export async function deleteQuizQuestion(
  questionId: string,
  quizId: string
): Promise<{ success: boolean; error?: string }> {
  await connection();
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Akses ditolak.' };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  // Query quiz to revalidate
  const { data: quizMeta } = await supabase
    .from('course_quizzes')
    .select('course_id, weekly_topic_id')
    .eq('id', quizId)
    .single();

  const { error } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('id', questionId);

  if (error) return { success: false, error: error.message };

  if (quizMeta) {
    revalidatePath(`/courses/${quizMeta.course_id}/weeks/${quizMeta.weekly_topic_id}`);
    revalidatePath(`/courses/${quizMeta.course_id}/weeks/${quizMeta.weekly_topic_id}/quiz/${quizId}`);
    revalidatePath(`/admin/courses/${quizMeta.course_id}`);
  }
  revalidatePath(`/admin/quizzes/${quizId}`);
  revalidatePath('/admin/quizzes');

  return { success: true };
}

export async function deleteQuiz(
  quizId: string,
  courseId: string,
  topicId: string
): Promise<{ success: boolean; error?: string }> {
  await connection();
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Akses ditolak.' };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  const { error } = await supabase
    .from('course_quizzes')
    .delete()
    .eq('id', quizId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/courses/${courseId}/weeks/${topicId}`);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/admin/quizzes');
  return { success: true };
}

export async function toggleQuizPublishStatus(
  quizId: string,
  isPublished: boolean
): Promise<{ data?: CourseQuiz; error?: string }> {
  await connection();
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { error: auth.error || 'Akses ditolak.' };

  const supabase = await createClient();
  if (!supabase) return { error: 'Database unconfigured' };

  const { data: updated, error } = await supabase
    .from('course_quizzes')
    .update({
      is_published: isPublished,
      status: isPublished ? 'published' : 'draft',
      updated_at: new Date().toISOString(),
    })
    .eq('id', quizId)
    .select()
    .single();

  if (error) return { error: error.message };

  if (updated) {
    revalidatePath(`/courses/${updated.course_id}/weeks/${updated.weekly_topic_id}`);
    revalidatePath(`/admin/courses/${updated.course_id}`);
    revalidatePath(`/admin/quizzes/${quizId}`);
    revalidatePath('/admin/quizzes');
  }

  return { data: updated };
}

export async function getAllAdminQuizzes(): Promise<{
  data?: CourseQuiz[];
  error?: string;
}> {
  await connection();
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { error: auth.error || 'Akses ditolak.' };

  const supabase = await createClient();
  if (!supabase) return { error: 'Database unconfigured' };

  const { data: quizzes, error } = await supabase
    .from('course_quizzes')
    .select(
      '*, course:courses(id, name, code), weekly_topic:course_weekly_topics(id, week_number, topic_title), quiz_questions(id, points)'
    )
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };

  const formatted: CourseQuiz[] = (quizzes || []).map((q) => {
    const qList = (q.quiz_questions as { id: string; points: number }[]) || [];
    const totalPoints = qList.reduce((sum, item) => sum + (Number(item.points) || 0), 0);
    return {
      ...q,
      question_count: qList.length,
      total_points: totalPoints,
      quiz_questions: undefined,
    };
  });

  return { data: formatted };
}

// ==============================================================================
// 6. Student Quiz Experience & Scoring (Secure Server-Side Logic)
// ==============================================================================

export interface StudentQuizPayload {
  id: string;
  course_id: string;
  weekly_topic_id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number | null;
  passing_score: number;
  max_attempts: number;
  total_points: number;
  question_count: number;
  course?: { id: string; name: string; code?: string };
  weekly_topic?: { id: string; week_number: string; topic_title: string };
  questions: {
    id: string;
    question_text: string;
    question_type: QuestionType;
    points: number;
    display_order: number;
    options: {
      id: string;
      option_text: string;
      display_order: number;
      // Notice: is_correct is NEVER passed to student!
    }[];
  }[];
}

export async function getStudentQuiz(quizId: string): Promise<{
  data?: StudentQuizPayload;
  error?: string;
}> {
  await connection();
  const supabase = await createClient();
  if (!supabase) return { error: 'Database unconfigured' };

  // Fetch Quiz with course and weekly_topic
  const { data: quiz, error: quizError } = await supabase
    .from('course_quizzes')
    .select('*, course:courses(id, name, code), weekly_topic:course_weekly_topics(id, week_number, topic_title)')
    .eq('id', quizId)
    .single();

  if (quizError || !quiz) {
    return { error: 'Kuis tidak ditemukan.' };
  }

  // Fetch Questions
  const { data: questions, error: qError } = await supabase
    .from('quiz_questions')
    .select('*, quiz_question_options(id, option_text, display_order)')
    .eq('quiz_id', quizId)
    .order('display_order', { ascending: true });

  if (qError) return { error: qError.message };

  let formattedQuestions = (questions || []).map((q) => {
    let opts = (q.quiz_question_options as { id: string; option_text: string; display_order: number }[]) || [];
    if (quiz.shuffle_options) {
      opts = [...opts].sort(() => Math.random() - 0.5);
    } else {
      opts.sort((a, b) => a.display_order - b.display_order);
    }
    return {
      id: q.id,
      question_text: q.question_text,
      question_type: q.question_type as QuestionType,
      points: Number(q.points) || 10,
      display_order: q.display_order,
      options: opts,
    };
  });

  if (quiz.shuffle_questions) {
    formattedQuestions = [...formattedQuestions].sort(() => Math.random() - 0.5);
  }

  const totalPoints = formattedQuestions.reduce((sum, item) => sum + item.points, 0);

  return {
    data: {
      id: quiz.id,
      course_id: quiz.course_id,
      weekly_topic_id: quiz.weekly_topic_id,
      title: quiz.title,
      description: quiz.description,
      time_limit_minutes: quiz.time_limit_minutes,
      passing_score: Number(quiz.passing_score) || 70,
      max_attempts: quiz.max_attempts || 3,
      total_points: totalPoints,
      question_count: formattedQuestions.length,
      course: quiz.course as { id: string; name: string; code?: string } | undefined,
      weekly_topic: quiz.weekly_topic as { id: string; week_number: string; topic_title: string } | undefined,
      questions: formattedQuestions,
    },
  };
}

export interface QuizSubmissionData {
  quiz_id: string;
  student_name: string;
  student_identifier?: string;
  answers: {
    question_id: string;
    selected_option_ids: string[];
  }[];
}

export interface QuizAttemptResult {
  attempt_id: string;
  quiz_id: string;
  student_name: string;
  score: number;
  max_score: number;
  percentage: number;
  is_passed: boolean;
  passing_score: number;
  feedback: string;
  detailed_results?: {
    question_id: string;
    question_text: string;
    question_type: QuestionType;
    points: number;
    awarded_points: number;
    is_correct: boolean;
    user_selected_ids: string[];
    correct_option_ids: string[];
    explanation?: string | null;
    options: { id: string; option_text: string; is_correct: boolean }[];
  }[];
}

export async function submitQuizAttempt(
  submission: QuizSubmissionData
): Promise<{ data?: QuizAttemptResult; error?: string }> {
  await connection();
  const supabase = await createClient();
  if (!supabase) return { error: 'Database unconfigured' };

  if (!submission.student_name.trim()) {
    return { error: 'Nama mahasiswa wajib diisi untuk mencatat pengerjaan kuis.' };
  }

  // 1. Fetch Quiz with rules
  const { data: quiz, error: quizError } = await supabase
    .from('course_quizzes')
    .select('*')
    .eq('id', submission.quiz_id)
    .single();

  if (quizError || !quiz) {
    return { error: 'Kuis tidak ditemukan.' };
  }

  // 2. Fetch Authoritative Questions and Options with is_correct from DB
  const { data: dbQuestions, error: qError } = await supabase
    .from('quiz_questions')
    .select('*, quiz_question_options(*)')
    .eq('quiz_id', submission.quiz_id);

  if (qError || !dbQuestions || dbQuestions.length === 0) {
    return { error: 'Tidak dapat memvalidasi soal kuis.' };
  }

  // 3. Calculate Score on Server Side
  let totalScore = 0;
  let totalMaxScore = 0;
  const responseRecordsToInsert: {
    question_id: string;
    selected_option_ids: string[];
    is_correct: boolean;
    awarded_points: number;
  }[] = [];

  const detailedResults: NonNullable<QuizAttemptResult['detailed_results']> = [];

  const answersMap = new Map<string, string[]>();
  for (const ans of submission.answers) {
    answersMap.set(ans.question_id, ans.selected_option_ids || []);
  }

  for (const q of dbQuestions) {
    const qPoints = Number(q.points) || 10;
    totalMaxScore += qPoints;

    const options = (q.quiz_question_options as QuizQuestionOption[]) || [];
    const correctOptionIds = options.filter((o) => o.is_correct).map((o) => o.id);
    const userSelectedIds = answersMap.get(q.id) || [];

    let isCorrect = false;
    let awardedPoints = 0;

    if (q.question_type === 'single_choice' || q.question_type === 'true_false') {
      // Single answer exact match
      if (
        userSelectedIds.length === 1 &&
        correctOptionIds.length === 1 &&
        userSelectedIds[0] === correctOptionIds[0]
      ) {
        isCorrect = true;
        awardedPoints = qPoints;
      }
    } else if (q.question_type === 'multiple_choice') {
      // Exact-match scoring for multiple-choice by default
      const sortedUser = [...userSelectedIds].sort();
      const sortedCorrect = [...correctOptionIds].sort();
      if (
        sortedUser.length === sortedCorrect.length &&
        sortedUser.every((val, idx) => val === sortedCorrect[idx])
      ) {
        isCorrect = true;
        awardedPoints = qPoints;
      }
    }

    totalScore += awardedPoints;

    responseRecordsToInsert.push({
      question_id: q.id,
      selected_option_ids: userSelectedIds,
      is_correct: isCorrect,
      awarded_points: awardedPoints,
    });

    detailedResults.push({
      question_id: q.id,
      question_text: q.question_text,
      question_type: q.question_type as QuestionType,
      points: qPoints,
      awarded_points: awardedPoints,
      is_correct: isCorrect,
      user_selected_ids: userSelectedIds,
      correct_option_ids: quiz.show_correct_answers_after_submission ? correctOptionIds : [],
      explanation: quiz.show_correct_answers_after_submission ? q.explanation : null,
      options: options.map((opt) => ({
        id: opt.id,
        option_text: opt.option_text,
        is_correct: quiz.show_correct_answers_after_submission ? Boolean(opt.is_correct) : false,
      })),
    });
  }

  const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
  const isPassed = percentage >= (Number(quiz.passing_score) || 70);

  let feedback = '';
  if (percentage === 100) {
    feedback = 'Luar biasa! Anda berhasil menjawab seluruh pertanyaan dengan sempurna (100%).';
  } else if (isPassed) {
    feedback = `Selamat! Anda berhasil mencapai nilai kelulusan dengan skor ${percentage.toFixed(0)}%.`;
  } else {
    feedback = `Nilai Anda (${percentage.toFixed(0)}%) belum mencapai ambang batas kelulusan (${quiz.passing_score}%). Silakan pelajari kembali materi mingguan.`;
  }

  // 4. Record Attempt
  const { data: attemptRecord, error: attemptError } = await supabase
    .from('quiz_attempts')
    .insert({
      quiz_id: submission.quiz_id,
      student_name: submission.student_name.trim(),
      student_identifier: submission.student_identifier ? submission.student_identifier.trim() : null,
      started_at: new Date(Date.now() - 60000).toISOString(),
      submitted_at: new Date().toISOString(),
      status: 'completed',
      score: totalScore,
      max_score: totalMaxScore,
      percentage: Number(percentage.toFixed(2)),
      is_passed: isPassed,
      feedback: feedback,
    })
    .select()
    .single();

  if (attemptError || !attemptRecord) {
    return { error: `Gagal mencatat hasil kuis: ${attemptError?.message}` };
  }

  // 5. Record Individual Responses
  if (responseRecordsToInsert.length > 0) {
    const responsesWithAttempt = responseRecordsToInsert.map((r) => ({
      ...r,
      attempt_id: attemptRecord.id,
    }));
    await supabase.from('quiz_attempt_responses').insert(responsesWithAttempt);
  }

  return {
    data: {
      attempt_id: attemptRecord.id,
      quiz_id: quiz.id,
      student_name: submission.student_name,
      score: totalScore,
      max_score: totalMaxScore,
      percentage: Number(percentage.toFixed(1)),
      is_passed: isPassed,
      passing_score: Number(quiz.passing_score) || 70,
      feedback: feedback,
      detailed_results: detailedResults,
    },
  };
}
