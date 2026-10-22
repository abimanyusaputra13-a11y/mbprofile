'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CourseQuiz } from '@/types/course';
import { toggleQuizPublishStatus, deleteQuiz } from '@/lib/actions/weeklyLearning';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import {
  Award,
  Search,
  BookOpen,
  Clock,
  Layers,
  Edit3,
  Trash2,
  Globe,
  Lock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

interface QuizAdminListClientProps {
  initialQuizzes: CourseQuiz[];
  error?: string;
}

export function QuizAdminListClient({
  initialQuizzes,
  error,
}: QuizAdminListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [quizzes, setQuizzes] = useState<CourseQuiz[]>(initialQuizzes);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      const matchSearch =
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.course?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.course?.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.weekly_topic?.topic_title.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === 'published') return quiz.is_published;
      if (statusFilter === 'draft') return !quiz.is_published;
      return true;
    });
  }, [quizzes, searchQuery, statusFilter]);

  const handleTogglePublish = (quizId: string, currentStatus: boolean) => {
    setStatusMessage(null);
    startTransition(async () => {
      const res = await toggleQuizPublishStatus(quizId, !currentStatus);
      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
        setQuizzes((prev) =>
          prev.map((q) =>
            q.id === quizId
              ? {
                  ...q,
                  is_published: !currentStatus,
                  status: !currentStatus ? 'published' : 'draft',
                }
              : q
          )
        );
        setStatusMessage({
          type: 'success',
          text: !currentStatus
            ? 'Kuis berhasil dipublikasikan ke publik!'
            : 'Kuis disimpan sebagai draf.',
        });
        router.refresh();
      }
    });
  };

  const handleDelete = (quiz: CourseQuiz) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus kuis "${quiz.title}" beserta seluruh soalnya?`
      )
    )
      return;

    setStatusMessage(null);
    startTransition(async () => {
      const res = await deleteQuiz(quiz.id, quiz.course_id, quiz.weekly_topic_id);
      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
        setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
        setStatusMessage({ type: 'success', text: 'Kuis berhasil dihapus.' });
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/90 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Award className="size-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Kuis Evaluasi Mingguan
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Kelola kuis, pertanyaan (soal), dan publikasi ke materi mingguan mahasiswa.
          </p>
        </div>

        <Link href="/admin">
          <SecondaryButton
            variant="outline"
            size="sm"
            icon={<Layers className="size-3.5" />}
          >
            Daftar Silabus & Mata Kuliah
          </SecondaryButton>
        </Link>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-neutral-500 hover:text-neutral-900 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]">
        <div className="relative w-full sm:w-80">
          <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kuis, mata kuliah, topik..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-blue-600 bg-neutral-50/50"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'published', 'draft'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize cursor-pointer ${
                statusFilter === filter
                  ? 'bg-blue-600 text-white border border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {filter === 'all'
                ? 'Semua Kuis'
                : filter === 'published'
                ? 'Dipublikasikan'
                : 'Draf'}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes List */}
      {filteredQuizzes.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_#000] p-6 space-y-3">
          <Award className="size-10 text-neutral-300 mx-auto" />
          <div>
            <h3 className="font-bold text-neutral-800 text-sm">
              Tidak ada kuis yang ditemukan
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Coba ubah kata kunci pencarian atau filter status Anda.'
                : 'Kuis dapat dibuat melalui halaman modul mingguan di silabus mata kuliah.'}
            </p>
          </div>
          <Link href="/admin">
            <PrimaryButton variant="brand" size="sm" icon={<Layers className="size-3.5" />}>
              Buka Silabus Mata Kuliah
            </PrimaryButton>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="p-5 rounded-3xl bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Course & Week metadata */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {quiz.course?.code || 'MB'} • {quiz.course?.name || 'Mata Kuliah'}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
                      Minggu {quiz.weekly_topic?.week_number || '-'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePublish(quiz.id, quiz.is_published)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1 cursor-pointer ${
                      quiz.is_published
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    {quiz.is_published ? (
                      <>
                        <Globe className="size-2.5" />
                        <span>Publik</span>
                      </>
                    ) : (
                      <>
                        <Lock className="size-2.5" />
                        <span>Draf</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Title & Topic */}
                <div>
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    {quiz.title}
                  </h3>
                  {quiz.weekly_topic && (
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                      Topik: {quiz.weekly_topic.topic_title}
                    </p>
                  )}
                  {quiz.description && (
                    <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-neutral-50 border border-neutral-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-semibold">
                      Jumlah Soal
                    </span>
                    <span
                      className={`font-black ${
                        quiz.question_count && quiz.question_count > 0
                          ? 'text-neutral-900'
                          : 'text-amber-600'
                      }`}
                    >
                      {quiz.question_count || 0} Soal
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-semibold">
                      Total Poin
                    </span>
                    <span className="font-black text-emerald-700">
                      {quiz.total_points || 0} Pts
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-semibold">
                      Waktu
                    </span>
                    <span className="font-black text-neutral-900">
                      {quiz.time_limit_minutes ? `${quiz.time_limit_minutes}m` : 'Bebas'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/quizzes/${quiz.id}`} className="flex-1">
                    <PrimaryButton
                      variant={quiz.question_count ? 'brand' : 'yellow'}
                      size="sm"
                      className="w-full justify-center"
                      icon={<Edit3 className="size-3.5" />}
                    >
                      {quiz.question_count ? 'Kelola Soal' : 'Buat Soal Kuis'}
                    </PrimaryButton>
                  </Link>

                  <Link
                    href={`/courses/${quiz.course_id}/weeks/${quiz.weekly_topic_id}/quiz/${quiz.id}`}
                    target="_blank"
                    className="p-2 rounded-xl border border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition"
                    title="Pratinjau Kuis Mahasiswa"
                  >
                    <ExternalLink className="size-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(quiz)}
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Hapus Kuis"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                  <Link
                    href={`/courses/${quiz.course_id}/weeks/${quiz.weekly_topic_id}`}
                    className="hover:underline text-blue-600 font-semibold inline-flex items-center gap-0.5"
                  >
                    <span>Buka Topik Mingguan</span>
                    <ChevronRight className="size-3" />
                  </Link>
                  <span>Min. {quiz.passing_score}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
