'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CourseWithDetails } from '@/types/course';
import {
  saveCourseBasic,
  toggleCoursePublish,
  saveAssessment,
  deleteAssessment,
  saveWeeklyTopic,
  deleteWeeklyTopic,
  saveSummary,
  deleteSummary,
  saveReference,
  deleteReference,
  uploadCourseAttachment,
  deleteCourseAttachment,
  getAttachmentDownloadUrl,
} from '@/lib/actions/courses';
import { Badge } from '@/components/ui/Badge';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowLeft,
  Globe,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  Percent,
  BookMarked,
  Upload,
  Download,
  Trash2,
  Plus,
  Clock,
  Layers,
  BookOpen,
  ExternalLink,
} from 'lucide-react';

interface CourseEditorClientProps {
  initialCourse: CourseWithDetails;
}

export function CourseEditorClient({ initialCourse }: CourseEditorClientProps) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseWithDetails>(initialCourse);
  const [activeTab, setActiveTab] = useState<'info' | 'assessments' | 'syllabus' | 'summaries' | 'references' | 'attachments'>('info');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Basic Info Form State
  const [basicForm, setBasicForm] = useState({
    name: course.name,
    code: course.code || '',
    study_program: course.study_program || 'S1 Manajemen Bisnis',
    semester: course.semester ? course.semester.toString() : '',
    credits: course.credits ? course.credits.toString() : '',
    academic_year: course.academic_year || '',
    description: course.description || '',
  });

  // Modals for adding items
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({ component_name: '', percentage: '', description: '' });

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicForm, setTopicForm] = useState({ week_number: '1', topic_title: '', subtopics: '' });

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryForm, setSummaryForm] = useState({ title: '', content: '', content_format: 'markdown' as 'markdown' | 'plain', author: 'Tim Dosen MB ITS' });

  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [refForm, setRefForm] = useState({ title: '', author: '', publication_year: '', publisher: '', url: '', is_primary: true });

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('Slide Dosen');
  const [isUploading, setIsUploading] = useState(false);

  // Calculate assessment total percentage
  const totalAssessmentPercentage = course.assessments.reduce((sum, a) => sum + (Number(a.percentage) || 0), 0);

  // Handlers
  const handleSaveBasic = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    startTransition(async () => {
      const res = await saveCourseBasic({
        id: course.id,
        name: basicForm.name.trim(),
        code: basicForm.code.trim() || null,
        study_program: basicForm.study_program || null,
        semester: basicForm.semester ? parseInt(basicForm.semester, 10) : null,
        credits: basicForm.credits ? parseInt(basicForm.credits, 10) : null,
        academic_year: basicForm.academic_year.trim() || null,
        description: basicForm.description.trim() || null,
      });

      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else if (res.data) {
        setCourse((prev) => ({ ...prev, ...res.data! }));
        setStatusMessage({ type: 'success', text: 'Informasi dasar mata kuliah berhasil diperbarui.' });
      }
    });
  };

  const handleTogglePublish = () => {
    setStatusMessage(null);
    startTransition(async () => {
      const nextStatus = !course.is_published;
      const res = await toggleCoursePublish(course.id, nextStatus);
      if (res.success) {
        setCourse((prev) => ({ ...prev, is_published: nextStatus }));
        setStatusMessage({
          type: 'success',
          text: nextStatus
            ? 'Mata kuliah BERHASIL DITERBITKAN dan kini dapat diakses di halaman publik.'
            : 'Mata kuliah telah dialihkan menjadi DRAF PRIVAT.',
        });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Gagal mengubah status terbit.' });
      }
    });
  };

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentForm.component_name.trim()) return;
    setStatusMessage(null);

    const percentageVal = assessmentForm.percentage ? parseFloat(assessmentForm.percentage) : null;
    const res = await saveAssessment(course.id, {
      component_name: assessmentForm.component_name.trim(),
      percentage: percentageVal,
      description: assessmentForm.description.trim() || null,
      display_order: course.assessments.length + 1,
    });

    if (res.success) {
      setIsAssessmentModalOpen(false);
      setAssessmentForm({ component_name: '', percentage: '', description: '' });
      router.refresh();
      setStatusMessage({ type: 'success', text: 'Komponen penilaian berhasil ditambahkan.' });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Gagal menyimpan komponen penilaian.' });
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!confirm('Hapus komponen penilaian ini?')) return;
    const res = await deleteAssessment(course.id, id);
    if (res.success) {
      setCourse((prev) => ({ ...prev, assessments: prev.assessments.filter((a) => a.id !== id) }));
      setStatusMessage({ type: 'success', text: 'Komponen penilaian berhasil dihapus.' });
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicForm.topic_title.trim()) return;
    setStatusMessage(null);

    const res = await saveWeeklyTopic(course.id, {
      week_number: topicForm.week_number.trim(),
      topic_title: topicForm.topic_title.trim(),
      subtopics: topicForm.subtopics.trim() || null,
      display_order: course.weekly_topics.length + 1,
    });

    if (res.success) {
      setIsTopicModalOpen(false);
      setTopicForm({ week_number: '', topic_title: '', subtopics: '' });
      router.refresh();
      setStatusMessage({ type: 'success', text: 'Topik mingguan berhasil ditambahkan.' });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Gagal menyimpan topik mingguan.' });
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Hapus topik mingguan ini?')) return;
    const res = await deleteWeeklyTopic(course.id, id);
    if (res.success) {
      setCourse((prev) => ({ ...prev, weekly_topics: prev.weekly_topics.filter((t) => t.id !== id) }));
      setStatusMessage({ type: 'success', text: 'Topik mingguan berhasil dihapus.' });
    }
  };

  const handleAddSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summaryForm.title.trim() || !summaryForm.content.trim()) return;
    setStatusMessage(null);

    const res = await saveSummary(course.id, {
      title: summaryForm.title.trim(),
      content: summaryForm.content.trim(),
      content_format: summaryForm.content_format,
      author: summaryForm.author.trim() || null,
      is_published: true,
    });

    if (res.success) {
      setIsSummaryModalOpen(false);
      setSummaryForm({ title: '', content: '', content_format: 'markdown', author: 'Tim Dosen MB ITS' });
      router.refresh();
      setStatusMessage({ type: 'success', text: 'Rangkuman materi berhasil ditambahkan.' });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Gagal menyimpan rangkuman materi.' });
    }
  };

  const handleDeleteSummary = async (id: string) => {
    if (!confirm('Hapus rangkuman materi ini?')) return;
    const res = await deleteSummary(course.id, id);
    if (res.success) {
      setCourse((prev) => ({ ...prev, summaries: prev.summaries.filter((s) => s.id !== id) }));
      setStatusMessage({ type: 'success', text: 'Rangkuman materi berhasil dihapus.' });
    }
  };

  const handleAddReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refForm.title.trim() || !refForm.author.trim()) return;
    setStatusMessage(null);

    const res = await saveReference(course.id, {
      title: refForm.title.trim(),
      author: refForm.author.trim(),
      publication_year: refForm.publication_year.trim() || null,
      publisher: refForm.publisher.trim() || null,
      url: refForm.url.trim() || null,
      is_primary: refForm.is_primary,
    });

    if (res.success) {
      setIsRefModalOpen(false);
      setRefForm({ title: '', author: '', publication_year: '', publisher: '', url: '', is_primary: true });
      router.refresh();
      setStatusMessage({ type: 'success', text: 'Referensi bacaan berhasil ditambahkan.' });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Gagal menyimpan referensi.' });
    }
  };

  const handleDeleteReference = async (id: string) => {
    if (!confirm('Hapus referensi ini?')) return;
    const res = await deleteReference(course.id, id);
    if (res.success) {
      setCourse((prev) => ({ ...prev, references: prev.references.filter((r) => r.id !== id) }));
      setStatusMessage({ type: 'success', text: 'Referensi berhasil dihapus.' });
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('category', uploadCategory);

      const res = await uploadCourseAttachment(course.id, formData);
      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else if (res.data) {
        setCourse((prev) => ({ ...prev, attachments: [res.data!, ...prev.attachments] }));
        setUploadFile(null);
        setStatusMessage({ type: 'success', text: 'Berkas lampiran berhasil diunggah dan diamankan di Storage.' });
      }
    } catch (err: unknown) {
      console.error('Course attachment upload error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah berkas. Pastikan ukuran tidak melebihi 25 MB.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (id: string) => {
    if (!confirm('Hapus berkas lampiran ini dari server dan storage?')) return;
    const res = await deleteCourseAttachment(course.id, id);
    if (res.success) {
      setCourse((prev) => ({ ...prev, attachments: prev.attachments.filter((a) => a.id !== id) }));
      setStatusMessage({ type: 'success', text: 'Berkas lampiran berhasil dihapus dari storage.' });
    }
  };

  const handleDownloadAttachment = async (id: string) => {
    const res = await getAttachmentDownloadUrl(id);
    if (res.url) {
      window.open(res.url, '_blank');
    } else {
      alert(res.error || 'Gagal membuka tautan unduhan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition mb-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Kembali ke Daftar Mata Kuliah</span>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              {course.name}
            </h2>
            <Badge variant={course.is_published ? 'green' : 'yellow'} size="sm">
              {course.is_published ? 'Status: Terbit (Publik)' : 'Status: Draf (Privat)'}
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5 font-mono">
            Kode: {course.code || '(Belum Ada)'} • ID: {course.id}
          </p>
        </div>

        {/* Publish/Unpublish Action */}
        <button
          type="button"
          onClick={handleTogglePublish}
          disabled={isPending}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border shadow-xs ${
            course.is_published
              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {course.is_published ? (
            <>
              <EyeOff className="size-4" />
              <span>Jadikan Draf (Sembunyikan dari Publik)</span>
            </>
          ) : (
            <>
              <Globe className="size-4" />
              <span>Terbitkan Mata Kuliah ke Publik</span>
            </>
          )}
        </button>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="size-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <p className="font-semibold leading-relaxed">{statusMessage.text}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 overflow-x-auto pb-px">
        {[
          { key: 'info', label: '1. Informasi Pokok' },
          { key: 'assessments', label: `2. Penilaian (${course.assessments.length})` },
          { key: 'syllabus', label: `3. Topik & RPS (${course.weekly_topics.length})` },
          { key: 'summaries', label: `4. Rangkuman (${course.summaries.length})` },
          { key: 'references', label: `5. Referensi (${course.references.length})` },
          { key: 'attachments', label: `6. Lampiran & File (${course.attachments.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key as typeof activeTab);
              setStatusMessage(null);
            }}
            className={`px-4 py-2.5 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =========================================================================
          TAB 1: INFORMASI POKOK
         ========================================================================= */}
      {activeTab === 'info' && (
        <form onSubmit={handleSaveBasic} className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Nama Mata Kuliah: *
              </label>
              <input
                type="text"
                required
                value={basicForm.name}
                onChange={(e) => setBasicForm({ ...basicForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Kode Mata Kuliah:
              </label>
              <input
                type="text"
                value={basicForm.code}
                onChange={(e) => setBasicForm({ ...basicForm, code: e.target.value })}
                placeholder="Contoh: DB234101"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Program Studi:
              </label>
              <select
                value={basicForm.study_program}
                onChange={(e) => setBasicForm({ ...basicForm, study_program: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
              >
                <option value="S1 Manajemen Bisnis">S1 Manajemen Bisnis</option>
                <option value="S1 Bisnis Digital">S1 Bisnis Digital</option>
                <option value="Mata Kuliah Bersama (FDKBD/ITS)">Mata Kuliah Bersama</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Semester:
              </label>
              <select
                value={basicForm.semester}
                onChange={(e) => setBasicForm({ ...basicForm, semester: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
              >
                <option value="">(Belum ditentukan)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s.toString()}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Beban SKS:
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={basicForm.credits}
                onChange={(e) => setBasicForm({ ...basicForm, credits: e.target.value })}
                placeholder="3"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Tahun Kurikulum:
            </label>
            <input
              type="text"
              value={basicForm.academic_year}
              onChange={(e) => setBasicForm({ ...basicForm, academic_year: e.target.value })}
              placeholder="Contoh: Kurikulum 2023 / 2025/2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Deskripsi Mata Kuliah:
            </label>
            <textarea
              rows={4}
              value={basicForm.description}
              onChange={(e) => setBasicForm({ ...basicForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <PrimaryButton type="submit" variant="brand" size="md" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Perbarui Informasi Dasar'}
            </PrimaryButton>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 2: KOMPONEN PENILAIAN
         ========================================================================= */}
      {activeTab === 'assessments' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                Komponen & Bobot Penilaian
              </h3>
              <p className="text-xs text-neutral-500">
                Preservasi persentase nilai asli (contoh: UTS, UAS, Proyek).
              </p>
            </div>
            <PrimaryButton
              variant="brand"
              size="sm"
              icon={<Plus className="size-3.5" />}
              onClick={() => setIsAssessmentModalOpen(true)}
            >
              Tambah Komponen
            </PrimaryButton>
          </div>

          {/* Assessment Percentage Warning or Confirmation */}
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              totalAssessmentPercentage === 100
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Percent className="size-4 shrink-0" />
              <span>
                Total Bobot Penilaian Saat Ini: <b>{totalAssessmentPercentage}%</b>
              </span>
            </div>
            {totalAssessmentPercentage !== 100 && (
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Perhatian: Total bukan 100% (nilai asli tetap disimpan tanpa koreksi paksa)
              </span>
            )}
          </div>

          {/* Table / List */}
          {course.assessments.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center italic">
              Belum ada komponen penilaian yang ditambahkan.
            </p>
          ) : (
            <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden">
              {course.assessments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">{a.component_name}</h4>
                    {a.description && <p className="text-xs text-neutral-500 mt-0.5">{a.description}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-black text-sm bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                      {a.percentage !== null ? `${a.percentage}%` : 'Tanpa %'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAssessment(a.id)}
                      className="text-rose-500 hover:text-rose-700 transition p-1 cursor-pointer"
                      title="Hapus komponen"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: TOPIK MINGGUAN / RPS
         ========================================================================= */}
      {activeTab === 'syllabus' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                Topik Pembelajaran Mingguan (RPS)
              </h3>
              <p className="text-xs text-neutral-500">
                Daftar materi per minggu (mendukung gabungan seperti &quot;Weeks 1–2&quot;).
              </p>
            </div>
            <PrimaryButton
              variant="brand"
              size="sm"
              icon={<Plus className="size-3.5" />}
              onClick={() => setIsTopicModalOpen(true)}
            >
              Tambah Topik Minggu
            </PrimaryButton>
          </div>

          {course.weekly_topics.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center italic">
              Belum ada jadwal mingguan yang dicatat.
            </p>
          ) : (
            <div className="space-y-3">
              {course.weekly_topics.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl border border-neutral-200 hover:border-blue-400 transition bg-neutral-50/50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-md">
                        {t.week_number.toLowerCase().includes('week') ? t.week_number : `Minggu ${t.week_number}`}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-900">{t.topic_title}</h4>
                    </div>
                    {t.subtopics && (
                      <p className="text-xs text-neutral-600 leading-relaxed pl-1">{t.subtopics}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/courses/${course.id}/weeks/${t.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition shadow-2xs border border-blue-200"
                      title="Kelola materi bacaan, berkas lampiran, dan kuis untuk minggu ini"
                    >
                      <BookOpen className="size-3.5" />
                      <span>Kelola Modul Mingguan</span>
                      <ExternalLink className="size-3 opacity-60" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteTopic(t.id)}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition p-1.5 cursor-pointer shrink-0"
                      title="Hapus topik"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: RANGKUMAN MATERI
         ========================================================================= */}
      {activeTab === 'summaries' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                Rangkuman & Catatan Materi
              </h3>
              <p className="text-xs text-neutral-500">
                Catatan terstruktur atau ringkasan bab dalam format teks/Markdown.
              </p>
            </div>
            <PrimaryButton
              variant="brand"
              size="sm"
              icon={<Plus className="size-3.5" />}
              onClick={() => setIsSummaryModalOpen(true)}
            >
              Tambah Rangkuman
            </PrimaryButton>
          </div>

          {course.summaries.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center italic">
              Belum ada rangkuman materi untuk mata kuliah ini.
            </p>
          ) : (
            <div className="space-y-4">
              {course.summaries.map((s) => (
                <div key={s.id} className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-neutral-900">{s.title}</h4>
                    <button
                      type="button"
                      onClick={() => handleDeleteSummary(s.id)}
                      className="text-rose-500 hover:text-rose-700 transition p-1 cursor-pointer"
                      title="Hapus rangkuman"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  {s.author && <p className="text-[11px] text-neutral-400">Penulis: {s.author}</p>}
                  <div className="p-4 bg-white rounded-xl border border-neutral-200 text-xs text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {s.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: REFERENSI BUKU
         ========================================================================= */}
      {activeTab === 'references' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                Daftar Buku Teks & Referensi
              </h3>
              <p className="text-xs text-neutral-500">
                Buku acuan wajib dan literatur pendukung perkuliahan.
              </p>
            </div>
            <PrimaryButton
              variant="brand"
              size="sm"
              icon={<Plus className="size-3.5" />}
              onClick={() => setIsRefModalOpen(true)}
            >
              Tambah Referensi
            </PrimaryButton>
          </div>

          {course.references.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center italic">
              Belum ada referensi yang dicatat.
            </p>
          ) : (
            <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden">
              {course.references.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50 transition">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.is_primary ? 'bg-blue-100 text-blue-800' : 'bg-neutral-100 text-neutral-700'}`}>
                        {r.is_primary ? 'Utama / Wajib' : 'Pendukung'}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-900">{r.title}</h4>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Penulis: {r.author} {r.publication_year ? `(${r.publication_year})` : ''} {r.publisher ? `• ${r.publisher}` : ''}
                    </p>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs block">
                        {r.url}
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteReference(r.id)}
                    className="text-rose-500 hover:text-rose-700 transition p-1 cursor-pointer shrink-0"
                    title="Hapus referensi"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 6: LAMPIRAN & BERKAS
         ========================================================================= */}
      {activeTab === 'attachments' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">
              Unggah & Kelola Berkas Lampiran
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              File disimpan secara privat di Supabase Storage. Pengunjung umum hanya dapat mengunduh berkas jika mata kuliah berstatus Terbit. Batas ukuran 25 MB per file.
            </p>
          </div>

          {/* Upload Form Box */}
          <form onSubmit={handleUploadFile} className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Unggah Berkas Baru:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-6">
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-neutral-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
              </div>
              <div className="sm:col-span-4">
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-300 bg-white"
                >
                  <option value="Slide Dosen">Slide Dosen</option>
                  <option value="Silabus / RPS">Silabus / RPS</option>
                  <option value="Modul Praktikum">Modul Praktikum</option>
                  <option value="Latihan Soal">Latihan Soal</option>
                  <option value="Template Tugas">Template Tugas</option>
                  <option value="Dokumen">Dokumen Lainnya</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <PrimaryButton type="submit" variant="brand" size="sm" disabled={isUploading || !uploadFile} className="w-full justify-center">
                  {isUploading ? 'Mengunggah...' : 'Unggah'}
                </PrimaryButton>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400">
              Format diizinkan: PDF, Word (DOC/DOCX), Excel (XLS/XLSX), Gambar (PNG/JPG/WebP). Maksimal 25 MB.
            </p>
          </form>

          {/* Attachments List */}
          {course.attachments.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center italic">
              Belum ada berkas lampiran yang diunggah.
            </p>
          ) : (
            <div className="space-y-2">
              {course.attachments.map((att) => (
                <div key={att.id} className="flex items-center justify-between p-3.5 bg-neutral-50/70 border border-neutral-200 rounded-2xl hover:border-blue-300 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                      <FileText className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">{att.file_name}</p>
                      <p className="text-[11px] text-neutral-500">
                        {att.file_category} • {(att.file_size_bytes / (1024 * 1024)).toFixed(2)} MB • {att.download_count}x diunduh
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadAttachment(att.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-white border border-neutral-300 hover:border-blue-600 text-neutral-700 hover:text-blue-600 transition cursor-pointer"
                    >
                      <Download className="size-3.5" />
                      <span>Unduh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAttachment(att.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                      title="Hapus berkas"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODALS
         ========================================================================= */}
      {/* Assessment Modal */}
      {isAssessmentModalOpen && (
        <Modal
          isOpen={isAssessmentModalOpen}
          onClose={() => setIsAssessmentModalOpen(false)}
          title="Tambah Komponen Penilaian"
          subtitle={course.name}
          maxWidth="md"
        >
          <form onSubmit={handleAddAssessment} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Nama Komponen: *
              </label>
              <input
                required
                type="text"
                placeholder="Contoh: Ujian Tengah Semester (UTS) / Proyek Mandiri"
                value={assessmentForm.component_name}
                onChange={(e) => setAssessmentForm({ ...assessmentForm, component_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Persentase Bobot (%):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Contoh: 30"
                value={assessmentForm.percentage}
                onChange={(e) => setAssessmentForm({ ...assessmentForm, percentage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Keterangan Tambahan (Opsional):
              </label>
              <input
                type="text"
                placeholder="Contoh: Terdiri dari studi kasus individual"
                value={assessmentForm.description}
                onChange={(e) => setAssessmentForm({ ...assessmentForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <SecondaryButton variant="outline" size="sm" onClick={() => setIsAssessmentModalOpen(false)}>
                Batal
              </SecondaryButton>
              <PrimaryButton type="submit" variant="brand" size="sm">
                Simpan Komponen
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* Weekly Topic Modal */}
      {isTopicModalOpen && (
        <Modal
          isOpen={isTopicModalOpen}
          onClose={() => setIsTopicModalOpen(false)}
          title="Tambah Topik Pembelajaran Mingguan"
          subtitle={course.name}
          maxWidth="md"
        >
          <form onSubmit={handleAddTopic} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Nomor / Rentang Minggu: *
              </label>
              <input
                required
                type="text"
                placeholder="Contoh: 1 atau Weeks 1–2"
                value={topicForm.week_number}
                onChange={(e) => setTopicForm({ ...topicForm, week_number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Judul Topik Pembelajaran: *
              </label>
              <input
                required
                type="text"
                placeholder="Contoh: Pengantar Analisis Laporan Keuangan"
                value={topicForm.topic_title}
                onChange={(e) => setTopicForm({ ...topicForm, topic_title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Subtopik / Pokok Bahasan:
              </label>
              <textarea
                rows={3}
                placeholder="Rincian subtopik yang diajarkan pada minggu ini..."
                value={topicForm.subtopics}
                onChange={(e) => setTopicForm({ ...topicForm, subtopics: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <SecondaryButton variant="outline" size="sm" onClick={() => setIsTopicModalOpen(false)}>
                Batal
              </SecondaryButton>
              <PrimaryButton type="submit" variant="brand" size="sm">
                Simpan Topik
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* Summary Modal */}
      {isSummaryModalOpen && (
        <Modal
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          title="Tambah Rangkuman Materi"
          subtitle={course.name}
          maxWidth="lg"
        >
          <form onSubmit={handleAddSummary} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Judul Rangkuman: *
              </label>
              <input
                required
                type="text"
                placeholder="Contoh: Rangkuman Bab 1: Valuasi Saham dan Nilai Waktu Uang"
                value={summaryForm.title}
                onChange={(e) => setSummaryForm({ ...summaryForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Format Konten:
                </label>
                <select
                  value={summaryForm.content_format}
                  onChange={(e) => setSummaryForm({ ...summaryForm, content_format: e.target.value as 'markdown' | 'plain' })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white"
                >
                  <option value="markdown">Markdown</option>
                  <option value="plain">Teks Biasa</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Penulis / Tim Dosen:
                </label>
                <input
                  type="text"
                  value={summaryForm.author}
                  onChange={(e) => setSummaryForm({ ...summaryForm, author: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Isi Rangkuman Materi: *
              </label>
              <textarea
                required
                rows={6}
                placeholder="Tuliskan intisari materi, rumus penting, konsep kunci..."
                value={summaryForm.content}
                onChange={(e) => setSummaryForm({ ...summaryForm, content: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 font-mono text-xs leading-relaxed"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <SecondaryButton variant="outline" size="sm" onClick={() => setIsSummaryModalOpen(false)}>
                Batal
              </SecondaryButton>
              <PrimaryButton type="submit" variant="brand" size="sm">
                Simpan Rangkuman
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* Reference Modal */}
      {isRefModalOpen && (
        <Modal
          isOpen={isRefModalOpen}
          onClose={() => setIsRefModalOpen(false)}
          title="Tambah Buku Referensi"
          subtitle={course.name}
          maxWidth="md"
        >
          <form onSubmit={handleAddReference} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Judul Buku / Jurnal: *
              </label>
              <input
                required
                type="text"
                placeholder="Contoh: Principles of Corporate Finance"
                value={refForm.title}
                onChange={(e) => setRefForm({ ...refForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Nama Penulis / Pengarang: *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Brealey, Myers, Allen"
                  value={refForm.author}
                  onChange={(e) => setRefForm({ ...refForm, author: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Tahun Terbit:
                </label>
                <input
                  type="text"
                  placeholder="2023"
                  value={refForm.publication_year}
                  onChange={(e) => setRefForm({ ...refForm, publication_year: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Penerbit:
                </label>
                <input
                  type="text"
                  placeholder="McGraw-Hill Education"
                  value={refForm.publisher}
                  onChange={(e) => setRefForm({ ...refForm, publisher: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Klasifikasi:
                </label>
                <select
                  value={refForm.is_primary ? 'true' : 'false'}
                  onChange={(e) => setRefForm({ ...refForm, is_primary: e.target.value === 'true' })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white"
                >
                  <option value="true">Referensi Utama / Wajib</option>
                  <option value="false">Referensi Pendukung</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Tautan Sumber Digital (Opsional):
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={refForm.url}
                onChange={(e) => setRefForm({ ...refForm, url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <SecondaryButton variant="outline" size="sm" onClick={() => setIsRefModalOpen(false)}>
                Batal
              </SecondaryButton>
              <PrimaryButton type="submit" variant="brand" size="sm">
                Simpan Referensi
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
