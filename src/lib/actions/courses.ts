'use server';

import { connection } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { verifyAdminStatus } from '@/lib/supabase/auth';
import { Course, CourseWithDetails, CourseAttachment } from '@/types/course';
import { revalidatePath } from 'next/cache';

// Allowed file MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/webp',
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * Fetch all courses for Admin Dashboard (includes drafts & published)
 */
export async function getAdminCourses(): Promise<{ data: Course[]; error?: string }> {
  await connection();
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) {
    return { data: [], error: auth.error || 'Unauthorized access' };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { data: [], error: 'Supabase credentials not configured' };
  }

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [] };
}

/**
 * Fetch a single course with all child relations
 */
export async function getAdminCourseDetails(courseId: string): Promise<{ data: CourseWithDetails | null; error?: string }> {
  await connection();
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) {
    return { data: null, error: auth.error || 'Unauthorized access' };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { data: null, error: 'Supabase credentials not configured' };
  }

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (courseError || !course) {
    return { data: null, error: courseError?.message || 'Course not found' };
  }

  const [assessmentsRes, topicsRes, summariesRes, referencesRes, attachmentsRes] = await Promise.all([
    supabase.from('course_assessments').select('*').eq('course_id', courseId).order('display_order', { ascending: true }),
    supabase.from('course_weekly_topics').select('*').eq('course_id', courseId).order('display_order', { ascending: true }),
    supabase.from('course_summaries').select('*').eq('course_id', courseId).order('created_at', { ascending: true }),
    supabase.from('course_references').select('*').eq('course_id', courseId).order('is_primary', { ascending: false }),
    supabase.from('course_attachments').select('*').eq('course_id', courseId).order('created_at', { ascending: false }),
  ]);

  return {
    data: {
      ...course,
      assessments: assessmentsRes.data || [],
      weekly_topics: topicsRes.data || [],
      summaries: summariesRes.data || [],
      references: referencesRes.data || [],
      attachments: attachmentsRes.data || [],
    },
  };
}

/**
 * Create or update a course's basic information
 */
export async function saveCourseBasic(courseData: Partial<Course> & { name: string }): Promise<{ data?: Course; error?: string }> {
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) {
    return { error: auth.error || 'Unauthorized' };
  }

  const supabase = await createClient();
  if (!supabase) return { error: 'Database unconfigured' };

  if (courseData.id) {
    // Update existing course
    const { data, error } = await supabase
      .from('courses')
      .update({
        code: courseData.code || null,
        name: courseData.name,
        study_program: courseData.study_program || null,
        semester: courseData.semester || null,
        credits: courseData.credits || null,
        academic_year: courseData.academic_year || null,
        description: courseData.description || null,
      })
      .eq('id', courseData.id)
      .select()
      .single();

    if (error) return { error: error.message };
    revalidatePath('/admin');
    revalidatePath(`/admin/courses/${courseData.id}`);
    revalidatePath('/materi-soal');
    return { data };
  } else {
    // Insert new course as DRAFT by default
    const { data, error } = await supabase
      .from('courses')
      .insert({
        code: courseData.code || null,
        name: courseData.name,
        study_program: courseData.study_program || null,
        semester: courseData.semester || null,
        credits: courseData.credits || null,
        academic_year: courseData.academic_year || null,
        description: courseData.description || null,
        is_published: false, // Always draft initially
      })
      .select()
      .single();

    if (error) return { error: error.message };
    revalidatePath('/admin');
    return { data };
  }
}

/**
 * Toggle published state of a course
 */
export async function toggleCoursePublish(courseId: string, isPublished: boolean): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Unauthorized' };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  const { error } = await supabase
    .from('courses')
    .update({ is_published: isPublished })
    .eq('id', courseId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin');
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/materi-soal');
  return { success: true };
}

/**
 * Delete a course and its storage attachments deliberately
 */
export async function deleteCourse(courseId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Unauthorized' };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  // 1. Find all attachments to clean up from storage
  const { data: attachments } = await supabase
    .from('course_attachments')
    .select('storage_path')
    .eq('course_id', courseId);

  if (attachments && attachments.length > 0) {
    const paths = attachments.map((a) => a.storage_path);
    await supabase.storage.from('course-attachments').remove(paths);
  }

  // 2. Delete the course (cascades database child records)
  const { error } = await supabase.from('courses').delete().eq('id', courseId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin');
  revalidatePath('/materi-soal');
  return { success: true };
}

/**
 * Bulk update publication status of courses (publish or archive/draft)
 */
export async function bulkUpdateCoursePublish(
  courseIds: string[],
  isPublished: boolean
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Unauthorized' };

  if (!courseIds || courseIds.length === 0) return { success: true };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  const { error } = await supabase
    .from('courses')
    .update({ is_published: isPublished })
    .in('id', courseIds);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin');
  revalidatePath('/courses');
  revalidatePath('/materi-soal');
  revalidatePath('/');
  return { success: true };
}

/**
 * Bulk delete courses and their storage attachments
 */
export async function bulkDeleteCourses(
  courseIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Unauthorized' };

  if (!courseIds || courseIds.length === 0) return { success: true };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  // 1. Find all attachments to clean up from storage
  const { data: attachments } = await supabase
    .from('course_attachments')
    .select('storage_path')
    .in('course_id', courseIds);

  if (attachments && attachments.length > 0) {
    const paths = attachments.map((a) => a.storage_path).filter(Boolean);
    if (paths.length > 0) {
      await supabase.storage.from('course-attachments').remove(paths);
    }
  }

  // 2. Weekly attachments if any
  const { data: weeklyAtts } = await supabase
    .from('course_weekly_attachments')
    .select('storage_path')
    .in('course_id', courseIds);

  if (weeklyAtts && weeklyAtts.length > 0) {
    const weeklyPaths = weeklyAtts.map((a) => a.storage_path).filter(Boolean);
    if (weeklyPaths.length > 0) {
      await supabase.storage.from('course-attachments').remove(weeklyPaths);
    }
  }

  // 3. Delete courses from database
  const { error } = await supabase.from('courses').delete().in('id', courseIds);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin');
  revalidatePath('/courses');
  revalidatePath('/materi-soal');
  revalidatePath('/');
  return { success: true };
}

/**
 * Save Assessment Component
 */
export async function saveAssessment(
  courseId: string,
  assessment: { id?: string; component_name: string; percentage: number | null; description?: string | null; display_order?: number }
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Unauthorized' };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  if (assessment.id) {
    const { error } = await supabase
      .from('course_assessments')
      .update({
        component_name: assessment.component_name,
        percentage: assessment.percentage,
        description: assessment.description || null,
        display_order: assessment.display_order ?? 0,
      })
      .eq('id', assessment.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from('course_assessments')
      .insert({
        course_id: courseId,
        component_name: assessment.component_name,
        percentage: assessment.percentage,
        description: assessment.description || null,
        display_order: assessment.display_order ?? 0,
      });
    if (error) return { success: false, error: error.message };
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/materi-soal');
  return { success: true };
}

export async function deleteAssessment(courseId: string, assessmentId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Unauthorized' };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  const { error } = await supabase.from('course_assessments').delete().eq('id', assessmentId);
  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/materi-soal');
  return { success: true };
}

/**
 * Save Weekly Topic (Supports ranges e.g. "Weeks 1–2")
 */
export async function saveWeeklyTopic(
  courseId: string,
  topic: { id?: string; week_number: string; topic_title: string; subtopics?: string | null; display_order?: number }
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Unauthorized' };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  if (topic.id) {
    const { error } = await supabase
      .from('course_weekly_topics')
      .update({
        week_number: topic.week_number,
        topic_title: topic.topic_title,
        subtopics: topic.subtopics || null,
        display_order: topic.display_order ?? 0,
      })
      .eq('id', topic.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from('course_weekly_topics')
      .insert({
        course_id: courseId,
        week_number: topic.week_number,
        topic_title: topic.topic_title,
        subtopics: topic.subtopics || null,
        display_order: topic.display_order ?? 0,
      });
    if (error) return { success: false, error: error.message };
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/materi-soal');
  return { success: true };
}

export async function deleteWeeklyTopic(courseId: string, topicId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Unauthorized' };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  const { error } = await supabase.from('course_weekly_topics').delete().eq('id', topicId);
  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/materi-soal');
  return { success: true };
}

/**
 * Save Course Summary (Markdown or plain text)
 */
export async function saveSummary(
  courseId: string,
  summary: { id?: string; title: string; content: string; content_format?: 'markdown' | 'plain'; author?: string | null; is_published?: boolean }
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Unauthorized' };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  if (summary.id) {
    const { error } = await supabase
      .from('course_summaries')
      .update({
        title: summary.title,
        content: summary.content,
        content_format: summary.content_format || 'markdown',
        author: summary.author || null,
        is_published: summary.is_published ?? true,
      })
      .eq('id', summary.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from('course_summaries')
      .insert({
        course_id: courseId,
        title: summary.title,
        content: summary.content,
        content_format: summary.content_format || 'markdown',
        author: summary.author || null,
        is_published: summary.is_published ?? true,
      });
    if (error) return { success: false, error: error.message };
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/materi-soal');
  return { success: true };
}

export async function deleteSummary(courseId: string, summaryId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Unauthorized' };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  const { error } = await supabase.from('course_summaries').delete().eq('id', summaryId);
  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/materi-soal');
  return { success: true };
}

/**
 * Save Course Reference
 */
export async function saveReference(
  courseId: string,
  ref: { id?: string; title: string; author: string; publication_year?: string | null; publisher?: string | null; url?: string | null; is_primary?: boolean }
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Unauthorized' };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  if (ref.id) {
    const { error } = await supabase
      .from('course_references')
      .update({
        title: ref.title,
        author: ref.author,
        publication_year: ref.publication_year || null,
        publisher: ref.publisher || null,
        url: ref.url || null,
        is_primary: ref.is_primary ?? true,
      })
      .eq('id', ref.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from('course_references')
      .insert({
        course_id: courseId,
        title: ref.title,
        author: ref.author,
        publication_year: ref.publication_year || null,
        publisher: ref.publisher || null,
        url: ref.url || null,
        is_primary: ref.is_primary ?? true,
      });
    if (error) return { success: false, error: error.message };
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/materi-soal');
  return { success: true };
}

export async function deleteReference(courseId: string, refId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Unauthorized' };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  const { error } = await supabase.from('course_references').delete().eq('id', refId);
  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/materi-soal');
  return { success: true };
}

/**
 * Upload Course Attachment
 */
export async function uploadCourseAttachment(
  courseId: string,
  formData: FormData
): Promise<{ data?: CourseAttachment; error?: string }> {
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { error: auth.error || 'Unauthorized' };

  const supabase = await createClient();
  if (!supabase) return { error: 'Database unconfigured' };

  const file = formData.get('file') as File;
  const category = (formData.get('category') as string) || 'Dokumen';

  if (!file || file.size === 0) {
    return { error: 'No file provided.' };
  }

  // 1. Validate File Size (25 MB max)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: `Ukuran berkas (${(file.size / (1024 * 1024)).toFixed(1)} MB) melebihi batas maksimum 25 MB.` };
  }

  // 2. Validate MIME Type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: `Tipe berkas (${file.type || 'unknown'}) tidak diizinkan. Gunakan PDF, DOC/DOCX, XLS/XLSX, atau Gambar PNG/JPG/WebP.` };
  }

  // 3. Generate safe storage path
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `courses/${courseId}/${Date.now()}_${sanitizedName}`;

  // 4. Upload to Supabase Storage
  const adminClient = createAdminClient();
  const storageClient = adminClient || supabase;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await storageClient.storage
    .from('course-attachments')
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { error: `Gagal mengunggah berkas: ${uploadError.message}` };
  }

  // 5. Insert metadata record in course_attachments
  const { data: attachmentRecord, error: dbError } = await supabase
    .from('course_attachments')
    .insert({
      course_id: courseId,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      file_size_bytes: file.size,
      file_category: category,
      is_published: true,
    })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded file if database record insertion failed
    await supabase.storage.from('course-attachments').remove([storagePath]);
    return { error: dbError.message };
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/materi-soal');
  return { data: attachmentRecord };
}

/**
 * Delete Course Attachment
 */
export async function deleteCourseAttachment(courseId: string, attachmentId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminStatus();
  if (!auth.isAdmin) return { success: false, error: auth.error || 'Unauthorized' };

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database unconfigured' };

  // 1. Get storage path
  const { data: attachment, error: fetchError } = await supabase
    .from('course_attachments')
    .select('storage_path')
    .eq('id', attachmentId)
    .single();

  if (fetchError || !attachment) {
    return { success: false, error: 'Lampiran tidak ditemukan' };
  }

  // 2. Remove from Storage
  await supabase.storage.from('course-attachments').remove([attachment.storage_path]);

  // 3. Delete from database
  const { error: deleteError } = await supabase.from('course_attachments').delete().eq('id', attachmentId);
  if (deleteError) return { success: false, error: deleteError.message };

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/materi-soal');
  return { success: true };
}

/**
 * Generate a short-lived Signed URL for downloading an attachment.
 * Checks whether the caller is admin OR the course/attachment is published.
 */
export async function getAttachmentDownloadUrl(attachmentId: string): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: 'Database unconfigured' };

  // Fetch attachment metadata and course status
  const { data: attachment, error: attError } = await supabase
    .from('course_attachments')
    .select('*, courses!inner(is_published)')
    .eq('id', attachmentId)
    .single();

  if (attError || !attachment) {
    return { error: 'Berkas lampiran tidak ditemukan.' };
  }

  const coursesObj = attachment.courses as { is_published?: boolean } | null;
  const isCoursePublished = coursesObj?.is_published;
  const isAttachmentPublished = attachment.is_published;

  // If not published, verify if caller is admin
  if (!isCoursePublished || !isAttachmentPublished) {
    const auth = await verifyAdminStatus();
    if (!auth.isAdmin) {
      return { error: 'Akses ditolak: Berkas ini berstatus draf atau privat.' };
    }
  }

  // Generate signed URL valid for 60 minutes
  const adminClient = createAdminClient();
  const storageClient = adminClient || supabase;

  const { data: signedData, error: signError } = await storageClient.storage
    .from('course-attachments')
    .createSignedUrl(attachment.storage_path, 3600);

  if (signError || !signedData?.signedUrl) {
    return { error: 'Gagal membuat tautan unduhan aman.' };
  }

  // Increment download count asynchronously
  await supabase
    .from('course_attachments')
    .update({ download_count: (attachment.download_count || 0) + 1 })
    .eq('id', attachmentId);

  return { url: signedData.signedUrl };
}

/**
 * Public action: Fetch published courses with their published details for /materi-soal
 */
export async function getPublicPublishedCourses(): Promise<{ data: CourseWithDetails[]; error?: string; isLiveDb: boolean }> {
  await connection();
  const supabase = await createClient();

  // If Supabase is not configured, signal caller to use fallback gracefully
  if (!supabase) {
    return { data: [], isLiveDb: false };
  }

  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('code', { ascending: true });

    if (error) {
      return { data: [], error: error.message, isLiveDb: true };
    }

    if (!courses || courses.length === 0) {
      return { data: [], isLiveDb: true };
    }

    // Fetch related published details
    const courseIds = courses.map((c) => c.id);

    const [assessmentsRes, topicsRes, summariesRes, referencesRes, attachmentsRes] = await Promise.all([
      supabase.from('course_assessments').select('*').in('course_id', courseIds).order('display_order', { ascending: true }),
      supabase.from('course_weekly_topics').select('*').in('course_id', courseIds).order('display_order', { ascending: true }),
      supabase.from('course_summaries').select('*').in('course_id', courseIds).eq('is_published', true).order('created_at', { ascending: true }),
      supabase.from('course_references').select('*').in('course_id', courseIds).order('is_primary', { ascending: false }),
      supabase.from('course_attachments').select('*').in('course_id', courseIds).eq('is_published', true).order('created_at', { ascending: false }),
    ]);

    const enriched: CourseWithDetails[] = courses.map((c) => ({
      ...c,
      assessments: (assessmentsRes.data || []).filter((a) => a.course_id === c.id),
      weekly_topics: (topicsRes.data || []).filter((t) => t.course_id === c.id),
      summaries: (summariesRes.data || []).filter((s) => s.course_id === c.id),
      references: (referencesRes.data || []).filter((r) => r.course_id === c.id),
      attachments: (attachmentsRes.data || []).filter((at) => at.course_id === c.id),
    }));

    return { data: enriched, isLiveDb: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memuat data dari database';
    return { data: [], error: message, isLiveDb: true };
  }
}
