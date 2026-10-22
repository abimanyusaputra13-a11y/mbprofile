import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminStatus } from '@/lib/supabase/auth';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  Clock,
  ChevronRight,
  FileText,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const instant = false;

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  await connection();
  const { id: courseId } = await params;

  const supabase = await createClient();
  if (!supabase) return notFound();

  const auth = await verifyAdminStatus();
  const isAdmin = auth.isAdmin;

  // 1. Fetch Course details
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (courseError || !course) {
    return notFound();
  }

  // If draft and not admin, deny
  if (!course.is_published && !isAdmin) {
    return (
      <PageContainer>
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="size-12 rounded-2xl bg-amber-100 text-amber-700 grid place-items-center mx-auto">
            <Lock className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Mata Kuliah Privat</h2>
          <p className="text-xs text-neutral-500">
            Mata kuliah ini sedang dalam penyusunan draf dan belum dibuka untuk akses publik.
          </p>
          <Link
            href="/materi-soal"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline pt-2"
          >
            <ArrowLeft className="size-4" />
            <span>Kembali ke Bank Materi</span>
          </Link>
        </div>
      </PageContainer>
    );
  }

  // 2. Fetch Weekly Topics with counts of materials, attachments, and quizzes
  let topicsQuery = supabase
    .from('course_weekly_topics')
    .select(`
      *,
      weekly_materials(id, is_published),
      course_attachments(id, is_published),
      course_quizzes(id, is_published)
    `)
    .eq('course_id', courseId)
    .order('display_order', { ascending: true });

  if (!isAdmin) {
    topicsQuery = topicsQuery.eq('is_published', true);
  }

  const { data: weeklyTopics } = await topicsQuery;

  // 3. Fetch Assessments and References
  const [assessmentsRes, referencesRes] = await Promise.all([
    supabase.from('course_assessments').select('*').eq('course_id', courseId).order('display_order', { ascending: true }),
    supabase.from('course_references').select('*').eq('course_id', courseId).order('is_primary', { ascending: false }),
  ]);

  const assessments = assessmentsRes.data || [];
  const references = referencesRes.data || [];

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* =========================================================================
          COURSE HEADER
         ========================================================================= */}
      <section className="relative overflow-hidden border-b border-neutral-100 bg-neutral-50/60 pt-8 pb-10">
        <div className="grid-lines absolute inset-0 -z-10" aria-hidden="true" />
        <PageContainer>
          {/* Breadcrumb */}
          <div className="mb-4">
            <Link
              href="/materi-soal"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition"
            >
              <ArrowLeft className="size-3.5" />
              <span>Kembali ke Materi & Soal</span>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                {course.code && (
                  <span className="font-mono text-xs font-bold bg-neutral-900 text-white px-2.5 py-1 rounded-lg">
                    {course.code}
                  </span>
                )}
                {course.study_program && (
                  <Badge variant="brand" size="sm">
                    {course.study_program}
                  </Badge>
                )}
                <Badge variant="yellow" size="sm">
                  {course.academic_year || 'Kurikulum Terkini'}
                </Badge>
                {!course.is_published && (
                  <Badge variant="neutral" size="sm">
                    Draf Privat (Akses Pengajar)
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-tight">
                {course.name}
              </h1>

              {course.description && (
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                  {course.description}
                </p>
              )}
            </div>

            {/* Quick Stats Card */}
            <div className="flex sm:flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-sm shrink-0 sm:min-w-[200px]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Beban Belajar
                </span>
                <p className="text-base sm:text-lg font-black text-blue-700">
                  {course.credits || 3} SKS
                </p>
              </div>
              <div className="sm:pt-2 sm:border-t sm:border-neutral-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Semester
                </span>
                <p className="text-sm sm:text-base font-bold text-neutral-900">
                  Semester {course.semester || 1}
                </p>
              </div>
              {isAdmin && (
                <div className="sm:pt-2 sm:border-t sm:border-neutral-100">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    <span>Buka Editor Admin</span>
                    <ChevronRight className="size-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          MAIN CONTENT: WEEKLY TOPICS & LEARNING MODULES
         ========================================================================= */}
      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2 Cols: Weekly Topic Modules */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                  <Calendar className="size-5 text-blue-600" />
                  <span>Modul Pembelajaran Mingguan</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Pilih minggu perkuliahan untuk membaca materi teks, mengunduh slide/dokumen, dan mengikuti kuis evaluasi mingguan.
                </p>
              </div>
            </div>

            {(!weeklyTopics || weeklyTopics.length === 0) ? (
              <div className="p-8 sm:p-12 text-center rounded-3xl bg-white border border-neutral-200/80 space-y-3">
                <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center mx-auto">
                  <BookOpen className="size-6" />
                </div>
                <h3 className="font-bold text-sm text-neutral-900">Belum Ada Topik Mingguan</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Daftar minggu pembelajaran untuk mata kuliah ini sedang disiapkan oleh tim pengajar departemen.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {weeklyTopics.map((topic, index) => {
                  const materialsList = topic.weekly_materials || [];
                  const attachmentsList = topic.course_attachments || [];
                  const quizzesList = topic.course_quizzes || [];

                  const publishedMaterials = isAdmin ? materialsList : materialsList.filter((m: any) => m.is_published);
                  const publishedAttachments = isAdmin ? attachmentsList : attachmentsList.filter((a: any) => a.is_published);
                  const publishedQuizzes = isAdmin ? quizzesList : quizzesList.filter((q: any) => q.is_published);

                  return (
                    <div
                      key={topic.id}
                      className="group relative bg-white rounded-3xl p-6 border border-neutral-200/90 hover:border-blue-500 hover:shadow-lg transition-all duration-300 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black bg-blue-600 text-white px-2.5 py-1 rounded-lg shadow-xs">
                              {topic.week_number.toLowerCase().includes('week')
                                ? topic.week_number
                                : `Minggu ${topic.week_number}`}
                            </span>
                            <h3 className="text-base font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                              {topic.topic_title}
                            </h3>
                          </div>
                          {(topic.description || topic.subtopics) && (
                            <p className="text-xs text-neutral-600 leading-relaxed pt-1 line-clamp-2">
                              {topic.description || topic.subtopics}
                            </p>
                          )}
                        </div>

                        <Link
                          href={`/courses/${course.id}/weeks/${topic.id}`}
                          className="inline-flex items-center gap-1.5 py-2 px-4 rounded-full text-xs font-bold bg-neutral-900 text-white hover:bg-blue-600 transition shadow-xs shrink-0 self-start sm:self-center"
                        >
                          <span>Masuk Modul</span>
                          <ChevronRight className="size-3.5" />
                        </Link>
                      </div>

                      {/* Content summary badges */}
                      <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-2.5 text-[11px] text-neutral-500">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-200/60 font-medium">
                          <FileText className="size-3 text-blue-600" />
                          <span>{publishedMaterials.length} Materi Teks</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-200/60 font-medium">
                          <Layers className="size-3 text-amber-600" />
                          <span>{publishedAttachments.length} Berkas Unduhan</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-200/60 font-medium">
                          <Award className="size-3 text-emerald-600" />
                          <span>{publishedQuizzes.length} Kuis Evaluasi</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Col: Supplementary Academic Info */}
          <div className="space-y-6">
            {/* Assessment Component Card */}
            {assessments.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Award className="size-4 text-blue-600" />
                  <span>Komposisi Penilaian (Evaluasi)</span>
                </h3>
                <div className="space-y-2 pt-1">
                  {assessments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-100 last:border-0">
                      <span className="text-neutral-700 font-medium">{a.component_name}</span>
                      <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-md">
                        {a.percentage !== null ? `${a.percentage}%` : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* References Card */}
            {references.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <BookOpen className="size-4 text-blue-600" />
                  <span>Pustaka Rujukan Mata Kuliah</span>
                </h3>
                <div className="space-y-3 pt-1 text-xs text-neutral-600">
                  {references.map((ref) => (
                    <div key={ref.id} className="space-y-0.5 border-l-2 border-blue-600 pl-3">
                      <p className="font-bold text-neutral-900">{ref.title}</p>
                      <p className="text-[11px] text-neutral-500">
                        {ref.author} {ref.publication_year ? `(${ref.publication_year})` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help / Guidance */}
            <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-200/80 space-y-2 text-xs text-neutral-700">
              <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Sparkles className="size-4 text-blue-600" />
                <span>Petunjuk Mahasiswa MB-ITS</span>
              </h4>
              <p className="leading-relaxed">
                Pelajari materi bacaan setiap minggu secara berurutan, unduh modul pendukung untuk bahan belajar mandiri, dan ikuti kuis mingguan untuk mengukur pemahaman konsep.
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
