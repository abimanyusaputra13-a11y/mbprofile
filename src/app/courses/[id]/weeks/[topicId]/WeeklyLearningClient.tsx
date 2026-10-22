'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { Modal } from '@/components/ui/Modal';
import { WeeklyLearningPageData, saveWeeklyMaterial, deleteWeeklyMaterial, uploadWeeklyAttachment, saveQuizBasic } from '@/lib/actions/weeklyLearning';
import { WeeklyMaterial, CourseAttachment, CourseQuiz } from '@/types/course';
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  FileText,
  Download,
  Award,
  Clock,
  Sparkles,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Layers,
  FileCheck,
  ChevronDown,
} from 'lucide-react';

interface WeeklyLearningClientProps {
  initialData: WeeklyLearningPageData;
}

export function WeeklyLearningClient({ initialData }: WeeklyLearningClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { course, allWeeklyTopics, currentTopic, materials: initialMaterials, attachments: initialAttachments, quizzes: initialQuizzes, isAdmin } = initialData;

  const [materials, setMaterials] = useState<WeeklyMaterial[]>(initialMaterials);
  const [attachments, setAttachments] = useState<CourseAttachment[]>(initialAttachments);
  const [quizzes, setQuizzes] = useState<CourseQuiz[]>(initialQuizzes);

  // Active material selection (tab if multiple)
  const [activeMaterialId, setActiveMaterialId] = useState<string>(
    materials.length > 0 ? materials[0].id : ''
  );

  const activeMaterial = materials.find((m) => m.id === activeMaterialId) || materials[0];

  // Admin Modals
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<WeeklyMaterial | null>(null);
  const [materialForm, setMaterialForm] = useState({
    title: '',
    content: '',
    status: 'published' as 'published' | 'draft',
  });

  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('Slide Dosen');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    time_limit_minutes: '15',
    passing_score: '70',
    max_attempts: '3',
  });

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Formatting helpers
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper to render markdown text cleanly
  const renderFormattedContent = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <div className="space-y-4 text-xs sm:text-sm text-neutral-800 leading-relaxed font-normal">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-sm sm:text-base font-bold text-neutral-900 pt-3 pb-1 border-b border-neutral-100">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-base sm:text-lg font-extrabold text-neutral-900 pt-4 pb-1.5 border-b border-neutral-200">
                {trimmed.replace('## ', '')}
              </h2>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-lg sm:text-xl font-black text-neutral-900 pt-5 pb-2">
                {trimmed.replace('# ', '')}
              </h1>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <li key={idx} className="ml-5 list-disc text-neutral-700">
                {trimmed.substring(2)}
              </li>
            );
          }
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={idx} className="p-3 my-2 bg-blue-50/70 border-l-4 border-blue-600 rounded-r-xl text-neutral-700 italic">
                {trimmed.replace('> ', '')}
              </blockquote>
            );
          }
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }
          return <p key={idx}>{trimmed}</p>;
        })}
      </div>
    );
  };

  // Handlers for Material Management
  const handleOpenMaterialModal = (item?: WeeklyMaterial) => {
    if (item) {
      setEditingMaterial(item);
      setMaterialForm({
        title: item.title,
        content: item.content,
        status: item.is_published ? 'published' : 'draft',
      });
    } else {
      setEditingMaterial(null);
      setMaterialForm({
        title: '',
        content: '## Pengenalan Materi\n\nTuliskan pokok bahasan materi perkuliahan di sini...\n\n### Poin-Poin Utama:\n- Poin pertama\n- Poin kedua',
        status: 'published',
      });
    }
    setIsMaterialModalOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.title.trim() || !materialForm.content.trim()) return;

    setStatusMessage(null);
    startTransition(async () => {
      const res = await saveWeeklyMaterial({
        id: editingMaterial?.id,
        course_id: course.id,
        weekly_topic_id: currentTopic.id,
        title: materialForm.title,
        content: materialForm.content,
        status: materialForm.status,
        is_published: materialForm.status === 'published',
      });

      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else if (res.data) {
        if (editingMaterial) {
          setMaterials((prev) => prev.map((m) => (m.id === res.data!.id ? res.data! : m)));
        } else {
          setMaterials((prev) => [...prev, res.data!]);
          setActiveMaterialId(res.data.id);
        }
        setIsMaterialModalOpen(false);
        setStatusMessage({ type: 'success', text: 'Materi pembelajaran berhasil disimpan.' });
        router.refresh();
      }
    });
  };

  const handleDeleteMaterial = (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus materi ini?')) return;
    setStatusMessage(null);
    startTransition(async () => {
      const res = await deleteWeeklyMaterial(id, course.id, currentTopic.id);
      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
        setMaterials((prev) => prev.filter((m) => m.id !== id));
        setStatusMessage({ type: 'success', text: 'Materi berhasil dihapus.' });
        router.refresh();
      }
    });
  };

  // Handlers for Attachment Upload
  const handleUploadAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('category', uploadCategory);

      const res = await uploadWeeklyAttachment(course.id, currentTopic.id, formData);
      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else if (res.data) {
        setAttachments((prev) => [res.data!, ...prev]);
        setIsAttachmentModalOpen(false);
        setUploadFile(null);
        setStatusMessage({ type: 'success', text: `Berkas "${res.data.file_name}" berhasil diunggah.` });
        router.refresh();
      }
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah berkas. Pastikan ukuran tidak melebihi 25 MB.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsUploading(false);
    }
  };

  // Handlers for Quiz Creation
  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizForm.title.trim()) return;

    setStatusMessage(null);
    startTransition(async () => {
      const res = await saveQuizBasic({
        course_id: course.id,
        weekly_topic_id: currentTopic.id,
        title: quizForm.title,
        description: quizForm.description,
        time_limit_minutes: quizForm.time_limit_minutes ? parseInt(quizForm.time_limit_minutes, 10) : null,
        passing_score: quizForm.passing_score ? parseFloat(quizForm.passing_score) : 70,
        max_attempts: quizForm.max_attempts ? parseInt(quizForm.max_attempts, 10) : 3,
        is_published: true,
      });

      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else if (res.data) {
        setQuizzes((prev) => [...prev, res.data!]);
        setIsQuizModalOpen(false);
        setStatusMessage({ type: 'success', text: 'Kuis berhasil dibuat. Silakan tambahkan pertanyaan kuis di panel admin.' });
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* =========================================================================
          TOP NAVBAR & WEEK SWITCHER
         ========================================================================= */}
      <section className="border-b border-neutral-200 bg-white sticky top-16 z-30 shadow-2xs">
        <PageContainer>
          <div className="flex items-center justify-between h-14 gap-4 overflow-x-auto">
            <Link
              href={`/courses/${course.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition shrink-0"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">Silabus Mata Kuliah</span>
              <span className="sm:hidden">Silabus</span>
            </Link>

            {/* Week Switcher Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {allWeeklyTopics.map((topic) => {
                const isCurrent = topic.id === currentTopic.id;
                return (
                  <Link
                    key={topic.id}
                    href={`/courses/${course.id}/weeks/${topic.id}`}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {topic.week_number.toLowerCase().includes('week')
                      ? topic.week_number
                      : `M-${topic.week_number}`}
                  </Link>
                );
              })}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* =========================================================================
          WEEK HEADER BANNER
         ========================================================================= */}
      <section className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-100 py-6">
        <PageContainer>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-black bg-blue-600 text-white px-2.5 py-1 rounded-lg shadow-xs">
                  {currentTopic.week_number.toLowerCase().includes('week')
                    ? currentTopic.week_number
                    : `Minggu ${currentTopic.week_number}`}
                </span>
                <span className="text-xs text-neutral-500 font-semibold">
                  {course.name} ({course.code || 'MB'})
                </span>
                {isAdmin && (
                  <Badge variant="brand" size="sm">
                    Mode Pengajar / Admin
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {currentTopic.topic_title}
              </h1>

              {(currentTopic.description || currentTopic.learning_objectives) && (
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-neutral-700 space-y-1">
                  {currentTopic.learning_objectives && (
                    <p className="font-semibold text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-blue-600" />
                      <span>Capaian Pembelajaran: {currentTopic.learning_objectives}</span>
                    </p>
                  )}
                  {currentTopic.description && (
                    <p className="text-neutral-600 leading-relaxed font-light">
                      {currentTopic.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Admin Quick Action Controls */}
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-2 shrink-0 self-start">
                <PrimaryButton
                  variant="brand"
                  size="sm"
                  icon={<Plus className="size-3.5" />}
                  onClick={() => handleOpenMaterialModal()}
                >
                  Tambah Materi Teks
                </PrimaryButton>
                <SecondaryButton
                  variant="outline"
                  size="sm"
                  icon={<Download className="size-3.5" />}
                  onClick={() => setIsAttachmentModalOpen(true)}
                >
                  Unggah Berkas
                </SecondaryButton>
                <SecondaryButton
                  variant="outline"
                  size="sm"
                  icon={<Award className="size-3.5" />}
                  onClick={() => setIsQuizModalOpen(true)}
                >
                  Buat Kuis
                </SecondaryButton>
              </div>
            )}
          </div>
        </PageContainer>
      </section>

      {/* Status Alert */}
      {statusMessage && (
        <PageContainer>
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {statusMessage.type === 'success' ? (
                <CheckCircle className="size-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="size-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-xs font-bold hover:underline cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </PageContainer>
      )}

      {/* =========================================================================
          THE THREE CORE SECTIONS
         ========================================================================= */}
      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* =====================================================================
              SECTION 1: TEXT-BASED LEARNING MATERIALS (2 COLS)
             ===================================================================== */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <BookOpen className="size-5 text-blue-600" />
                <span>1. Materi Bacaan & Kajian Teks</span>
              </h2>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleOpenMaterialModal()}
                  className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Tambah Materi</span>
                </button>
              )}
            </div>

            {materials.length === 0 ? (
              <div className="p-8 sm:p-12 text-center rounded-3xl bg-white border border-neutral-200/80 space-y-3">
                <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center mx-auto">
                  <FileText className="size-6" />
                </div>
                <h3 className="font-bold text-sm text-neutral-900">Belum Ada Materi Teks Diterbitkan</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Materi bacaan mandiri untuk minggu ini sedang dipersiapkan oleh dosen pengampu.
                </p>
                {isAdmin && (
                  <PrimaryButton
                    variant="brand"
                    size="sm"
                    icon={<Plus className="size-3.5" />}
                    onClick={() => handleOpenMaterialModal()}
                  >
                    Tulis Materi Pertama
                  </PrimaryButton>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Tabs if multiple materials exist */}
                {materials.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {materials.map((mat, idx) => (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => setActiveMaterialId(mat.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shrink-0 border ${
                          activeMaterial?.id === mat.id
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                            : 'bg-white text-neutral-600 hover:bg-neutral-50 border-neutral-200'
                        }`}
                      >
                        Bagian {idx + 1}: {mat.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Active Material Reader Card */}
                {activeMaterial && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900">
                          {activeMaterial.title}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
                          <Clock className="size-3.5 text-neutral-400" />
                          <span>Estimasi baca: ~{Math.max(2, Math.ceil(activeMaterial.content.length / 500))} menit</span>
                          <span>•</span>
                          <span>Format: {activeMaterial.content_format}</span>
                        </p>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenMaterialModal(activeMaterial)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-blue-600 p-1.5 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
                            title="Edit materi"
                          >
                            <Edit3 className="size-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMaterial(activeMaterial.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus materi"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Rendered Body */}
                    <div className="prose max-w-none">
                      {renderFormattedContent(activeMaterial.content)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =====================================================================
              SECTIONS 2 & 3: DOWNLOADABLE ATTACHMENTS & QUIZ (1 COL)
             ===================================================================== */}
          <div className="space-y-8">
            {/* ===================================================================
                SECTION 2: DOWNLOADABLE ATTACHMENTS
               =================================================================== */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Download className="size-4 text-amber-600" />
                  <span>2. Berkas & Lampiran</span>
                </h3>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsAttachmentModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="size-3" />
                    <span>Upload</span>
                  </button>
                )}
              </div>

              {attachments.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400 italic space-y-2">
                  <p>Tidak ada berkas unduhan tambahan untuk minggu ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3.5 rounded-2xl border border-neutral-200 hover:border-amber-400 bg-neutral-50/50 hover:bg-white transition space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-neutral-900 group-hover:text-blue-600 transition truncate" title={att.file_name}>
                            {att.file_name}
                          </p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">
                            {att.file_category} • {formatFileSize(att.file_size_bytes)}
                          </p>
                        </div>
                      </div>

                      {att.signedUrl ? (
                        <a
                          href={att.signedUrl}
                          download={att.file_name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-2xs"
                        >
                          <Download className="size-3.5" />
                          <span>Unduh Berkas</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-neutral-400 italic block">
                          Tautan unduhan privat
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===================================================================
                SECTION 3: WEEKLY QUIZZES
               =================================================================== */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Award className="size-4 text-emerald-600" />
                  <span>3. Kuis Evaluasi Mingguan</span>
                </h3>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsQuizModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="size-3" />
                    <span>Buat</span>
                  </button>
                )}
              </div>

              {quizzes.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400 italic space-y-2">
                  <p>Belum ada kuis mingguan yang dijadwalkan.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white to-neutral-50 border border-emerald-200 shadow-xs space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Evaluasi Mandiri
                          </span>
                          {quiz.time_limit_minutes && (
                            <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                              <Clock className="size-3" />
                              <span>{quiz.time_limit_minutes} Menit</span>
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-neutral-900 mt-1">
                          {quiz.title}
                        </h4>
                        {quiz.description && (
                          <p className="text-xs text-neutral-600 leading-relaxed mt-1">
                            {quiz.description}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 py-2 border-y border-emerald-100/80">
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Jumlah Soal:</span>
                          <span className="font-bold text-neutral-900">{quiz.question_count || 0} Pertanyaan</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Syarat Kelulusan:</span>
                          <span className="font-bold text-neutral-900">Min. {quiz.passing_score}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <Link
                          href={`/courses/${course.id}/weeks/${currentTopic.id}/quiz/${quiz.id}`}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-full text-xs font-bold bg-neutral-900 text-white hover:bg-emerald-600 transition shadow-xs"
                        >
                          <span>Mulai Kerjakan Kuis</span>
                          <ChevronRight className="size-3.5" />
                        </Link>
                      </div>

                      {isAdmin && (
                        <div className="pt-2 text-center">
                          <Link
                            href={`/admin/quizzes/${quiz.id}`}
                            className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Kelola Soal di Admin</span>
                            <ChevronRight className="size-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>

      {/* =========================================================================
          ADMIN MODAL: CREATE / EDIT MATERIAL
         ========================================================================= */}
      {isMaterialModalOpen && (
        <Modal
          isOpen={isMaterialModalOpen}
          onClose={() => setIsMaterialModalOpen(false)}
          title={editingMaterial ? 'Edit Materi Teks Mingguan' : 'Tambah Materi Teks Baru'}
          subtitle={`Minggu ${currentTopic.week_number} • ${course.name}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Judul Materi Bacaan: *
              </label>
              <input
                type="text"
                required
                value={materialForm.title}
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                placeholder="Contoh: Konsep Elastisitas Permintaan dan Penawaran"
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Isi Materi (Mendukung Markdown): *
              </label>
              <textarea
                rows={10}
                required
                value={materialForm.content}
                onChange={(e) => setMaterialForm({ ...materialForm, content: e.target.value })}
                placeholder="Gunakan # untuk judul, ## untuk subjudul, - untuk poin-poin..."
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 font-mono text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Status Publikasi:
              </label>
              <select
                value={materialForm.status}
                onChange={(e) => setMaterialForm({ ...materialForm, status: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 bg-white"
              >
                <option value="published">Diterbitkan (Publik untuk mahasiswa)</option>
                <option value="draft">Draf (Hanya terlihat oleh pengajar)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
              <SecondaryButton variant="outline" size="sm" onClick={() => setIsMaterialModalOpen(false)}>
                Batal
              </SecondaryButton>
              <PrimaryButton type="submit" variant="brand" size="sm" disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Simpan Materi'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================================
          ADMIN MODAL: UPLOAD ATTACHMENT
         ========================================================================= */}
      {isAttachmentModalOpen && (
        <Modal
          isOpen={isAttachmentModalOpen}
          onClose={() => setIsAttachmentModalOpen(false)}
          title="Unggah Berkas Pendukung Minggu Ini"
          subtitle={`Minggu ${currentTopic.week_number} • ${course.name}`}
          maxWidth="lg"
        >
          <form onSubmit={handleUploadAttachment} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Pilih Berkas (PDF, DOCX, PPTX, XLSX, ZIP, max 25MB): *
              </label>
              <input
                type="file"
                required
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full p-2 rounded-xl border border-neutral-300 bg-neutral-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Kategori Berkas:
              </label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 bg-white"
              >
                <option value="Slide Dosen">Slide Dosen</option>
                <option value="Silabus / RPS">Silabus / RPS</option>
                <option value="Modul Praktikum">Modul Praktikum</option>
                <option value="Latihan Soal">Latihan Soal</option>
                <option value="Template Tugas">Template Tugas</option>
                <option value="Dokumen">Dokumen Lainnya</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
              <SecondaryButton variant="outline" size="sm" onClick={() => setIsAttachmentModalOpen(false)}>
                Batal
              </SecondaryButton>
              <PrimaryButton type="submit" variant="brand" size="sm" disabled={isUploading || !uploadFile}>
                {isUploading ? 'Mengunggah...' : 'Unggah Sekarang'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================================
          ADMIN MODAL: CREATE QUIZ
         ========================================================================= */}
      {isQuizModalOpen && (
        <Modal
          isOpen={isQuizModalOpen}
          onClose={() => setIsQuizModalOpen(false)}
          title="Buat Kuis Evaluasi Baru"
          subtitle={`Minggu ${currentTopic.week_number} • ${course.name}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveQuiz} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Judul Kuis: *
              </label>
              <input
                type="text"
                required
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                placeholder="Contoh: Kuis Pemahaman Asumsi Dasar Ekonomi Mikro"
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Deskripsi / Petunjuk Pengerjaan:
              </label>
              <textarea
                rows={3}
                value={quizForm.description}
                onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                placeholder="Jawablah seluruh pertanyaan berikut dengan teliti. Nilai kelulusan minimal 70%."
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Batas Waktu (Menit):
                </label>
                <input
                  type="number"
                  min="0"
                  value={quizForm.time_limit_minutes}
                  onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: e.target.value })}
                  placeholder="15"
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Ambang Lulus (%):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={quizForm.passing_score}
                  onChange={(e) => setQuizForm({ ...quizForm, passing_score: e.target.value })}
                  placeholder="70"
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Maks. Percobaan:
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quizForm.max_attempts}
                  onChange={(e) => setQuizForm({ ...quizForm, max_attempts: e.target.value })}
                  placeholder="3"
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
              <SecondaryButton variant="outline" size="sm" onClick={() => setIsQuizModalOpen(false)}>
                Batal
              </SecondaryButton>
              <PrimaryButton type="submit" variant="brand" size="sm" disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Simpan Kuis'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
