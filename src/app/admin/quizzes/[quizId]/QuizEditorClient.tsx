'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  saveQuizBasic,
  saveQuizQuestion,
  deleteQuizQuestion,
} from '@/lib/actions/weeklyLearning';
import { CourseQuiz, QuizQuestion, QuestionType } from '@/types/course';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Save,
  HelpCircle,
  AlertCircle,
  Shuffle,
  Eye,
  Check,
} from 'lucide-react';

interface QuizEditorClientProps {
  initialQuiz: CourseQuiz;
}

interface QuestionFormState {
  id?: string;
  question_text: string;
  question_type: QuestionType;
  points: number;
  explanation: string;
  options: {
    id?: string;
    option_text: string;
    is_correct: boolean;
    display_order: number;
  }[];
}

export function QuizEditorClient({ initialQuiz }: QuizEditorClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [quiz, setQuiz] = useState<CourseQuiz>(initialQuiz);
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuiz.questions || []);

  // Basic Quiz Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    title: initialQuiz.title,
    description: initialQuiz.description || '',
    time_limit_minutes: initialQuiz.time_limit_minutes?.toString() || '',
    passing_score: initialQuiz.passing_score.toString(),
    max_attempts: initialQuiz.max_attempts.toString(),
    shuffle_questions: initialQuiz.shuffle_questions,
    shuffle_options: initialQuiz.shuffle_options,
    show_correct_answers_after_submission: initialQuiz.show_correct_answers_after_submission,
    is_published: initialQuiz.is_published,
  });

  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionFormState>({
    question_text: '',
    question_type: 'single_choice',
    points: 10,
    explanation: '',
    options: [
      { option_text: '', is_correct: true, display_order: 0 },
      { option_text: '', is_correct: false, display_order: 1 },
      { option_text: '', is_correct: false, display_order: 2 },
      { option_text: '', is_correct: false, display_order: 3 },
    ],
  });

  const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);

  // ===========================================================================
  // Save Basic Quiz Settings
  // ===========================================================================
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    startTransition(async () => {
      const res = await saveQuizBasic({
        id: quiz.id,
        course_id: quiz.course_id,
        weekly_topic_id: quiz.weekly_topic_id,
        title: settingsForm.title,
        description: settingsForm.description,
        time_limit_minutes: settingsForm.time_limit_minutes
          ? parseInt(settingsForm.time_limit_minutes, 10)
          : null,
        passing_score: settingsForm.passing_score
          ? parseFloat(settingsForm.passing_score)
          : 70,
        max_attempts: settingsForm.max_attempts
          ? parseInt(settingsForm.max_attempts, 10)
          : 3,
        shuffle_questions: settingsForm.shuffle_questions,
        shuffle_options: settingsForm.shuffle_options,
        show_correct_answers_after_submission:
          settingsForm.show_correct_answers_after_submission,
        is_published: settingsForm.is_published,
      });

      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else if (res.data) {
        setQuiz((prev) => ({ ...prev, ...res.data! }));
        setStatusMessage({
          type: 'success',
          text: 'Pengaturan kuis berhasil diperbarui.',
        });
        router.refresh();
      }
    });
  };

  // ===========================================================================
  // Open Modal for Add/Edit Question
  // ===========================================================================
  const handleOpenQuestionModal = (item?: QuizQuestion) => {
    if (item) {
      setEditingQuestion(item);
      setQuestionForm({
        id: item.id,
        question_text: item.question_text,
        question_type: item.question_type,
        points: item.points,
        explanation: item.explanation || '',
        options: item.options.map((opt) => ({
          id: opt.id,
          option_text: opt.option_text,
          is_correct: Boolean(opt.is_correct),
          display_order: opt.display_order,
        })),
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        question_text: '',
        question_type: 'single_choice',
        points: 10,
        explanation: '',
        options: [
          { option_text: '', is_correct: true, display_order: 0 },
          { option_text: '', is_correct: false, display_order: 1 },
          { option_text: '', is_correct: false, display_order: 2 },
          { option_text: '', is_correct: false, display_order: 3 },
        ],
      });
    }
    setIsQuestionModalOpen(true);
  };

  // Adjust options template when changing question type
  const handleTypeChange = (newType: QuestionType) => {
    if (newType === 'true_false') {
      setQuestionForm((prev) => ({
        ...prev,
        question_type: newType,
        options: [
          { option_text: 'Benar', is_correct: true, display_order: 0 },
          { option_text: 'Salah', is_correct: false, display_order: 1 },
        ],
      }));
    } else if (newType === 'single_choice') {
      // Ensure only 1 is correct
      const currentOpts = prevOptionsOrDefault(questionForm.options);
      const hasCorrect = currentOpts.some((o) => o.is_correct);
      const adjusted = currentOpts.map((o, idx) => ({
        ...o,
        is_correct: hasCorrect ? (idx === 0 ? true : false) : idx === 0,
      }));
      setQuestionForm((prev) => ({
        ...prev,
        question_type: newType,
        options: adjusted,
      }));
    } else {
      // multiple choice
      setQuestionForm((prev) => ({
        ...prev,
        question_type: newType,
        options: prevOptionsOrDefault(questionForm.options),
      }));
    }
  };

  const prevOptionsOrDefault = (opts: QuestionFormState['options']) => {
    if (opts.length >= 2) return opts;
    return [
      { option_text: '', is_correct: true, display_order: 0 },
      { option_text: '', is_correct: false, display_order: 1 },
    ];
  };

  // Option text change
  const handleOptionTextChange = (idx: number, text: string) => {
    setQuestionForm((prev) => {
      const nextOpts = [...prev.options];
      nextOpts[idx].option_text = text;
      return { ...prev, options: nextOpts };
    });
  };

  // Option correctness change
  const handleOptionCorrectToggle = (idx: number) => {
    setQuestionForm((prev) => {
      const nextOpts = [...prev.options];
      if (prev.question_type === 'single_choice' || prev.question_type === 'true_false') {
        // Set all others to false
        return {
          ...prev,
          options: nextOpts.map((opt, i) => ({
            ...opt,
            is_correct: i === idx,
          })),
        };
      } else {
        // Multiple choice: toggle
        nextOpts[idx].is_correct = !nextOpts[idx].is_correct;
        return { ...prev, options: nextOpts };
      }
    });
  };

  // Add option
  const handleAddOption = () => {
    if (questionForm.options.length >= 6) return;
    setQuestionForm((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          option_text: '',
          is_correct: false,
          display_order: prev.options.length,
        },
      ],
    }));
  };

  // Remove option
  const handleRemoveOption = (idx: number) => {
    if (questionForm.options.length <= 2) return;
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx),
    }));
  };

  // ===========================================================================
  // Save Question Submission
  // ===========================================================================
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.question_text.trim()) {
      alert('Teks soal wajib diisi.');
      return;
    }

    // Validate options
    const emptyOpts = questionForm.options.some((o) => !o.option_text.trim());
    if (emptyOpts) {
      alert('Semua pilihan jawaban harus diisi teks.');
      return;
    }

    const correctCount = questionForm.options.filter((o) => o.is_correct).length;
    if (
      (questionForm.question_type === 'single_choice' ||
        questionForm.question_type === 'true_false') &&
      correctCount !== 1
    ) {
      alert('Soal ini harus memiliki tepat 1 kunci jawaban yang benar.');
      return;
    }

    if (questionForm.question_type === 'multiple_choice' && correctCount < 1) {
      alert('Soal Pilihan Ganda Kompleks harus memiliki minimal 1 kunci jawaban yang benar.');
      return;
    }

    setStatusMessage(null);
    startTransition(async () => {
      const res = await saveQuizQuestion({
        id: editingQuestion?.id,
        quiz_id: quiz.id,
        question_text: questionForm.question_text,
        question_type: questionForm.question_type,
        points: Number(questionForm.points) || 10,
        explanation: questionForm.explanation,
        options: questionForm.options.map((opt, i) => ({
          id: opt.id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
          display_order: i,
        })),
      });

      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else if (res.data) {
        if (editingQuestion) {
          setQuestions((prev) =>
            prev.map((q) => (q.id === res.data!.id ? res.data! : q))
          );
        } else {
          setQuestions((prev) => [...prev, res.data!]);
        }
        setIsQuestionModalOpen(false);
        setStatusMessage({
          type: 'success',
          text: 'Pertanyaan kuis berhasil disimpan.',
        });
        router.refresh();
      }
    });
  };

  // ===========================================================================
  // Delete Question
  // ===========================================================================
  const handleDeleteQuestion = (questionId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;
    setStatusMessage(null);

    startTransition(async () => {
      const res = await deleteQuizQuestion(questionId, quiz.id);
      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        setStatusMessage({ type: 'success', text: 'Soal berhasil dihapus.' });
        router.refresh();
      }
    });
  };

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/90 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/courses/${quiz.course_id}/weeks/${quiz.weekly_topic_id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition"
              >
                <ArrowLeft className="size-3.5" />
                <span>Kembali ke Halaman Modul Mingguan</span>
              </Link>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Badge variant="brand" size="sm">
                {quiz.weekly_topic
                  ? `Minggu ${quiz.weekly_topic.week_number}`
                  : 'Modul Mingguan'}
              </Badge>
              {quiz.course && (
                <span className="text-xs text-neutral-500 font-bold">
                  {quiz.course.name} ({quiz.course.code || 'MB'})
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Kelola Kuis: {quiz.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/courses/${quiz.course_id}/weeks/${quiz.weekly_topic_id}/quiz/${quiz.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition shadow-2xs"
            >
              <Eye className="size-3.5" />
              <span>Pratinjau Kuis Mahasiswa</span>
              <ExternalLink className="size-3 text-neutral-400" />
            </Link>

            <button
              type="button"
              onClick={() => handleOpenQuestionModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Tambah Pertanyaan</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
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

        {/* 2-Column Layout: Left Settings & Rules, Right Questions List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ===================================================================
              LEFT COLUMN: QUIZ SETTINGS & RULES
             =================================================================== */}
          <div className="space-y-6">
            {/* Quick Stats Widget */}
            <div className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Statistik Kuis
              </h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-neutral-50 rounded-2xl">
                  <p className="text-2xl font-black text-neutral-900">
                    {questions.length}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5">
                    Jumlah Soal
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-2xl">
                  <p className="text-2xl font-black text-emerald-600">
                    {totalPoints}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5">
                    Total Poin
                  </p>
                </div>
              </div>
            </div>

            {/* Quiz Configuration Form */}
            <form
              onSubmit={handleSaveSettings}
              className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-sm space-y-4"
            >
              <h3 className="text-sm font-extrabold text-neutral-900 flex items-center gap-1.5 border-b border-neutral-100 pb-3">
                <Award className="size-4 text-blue-600" />
                <span>Pengaturan Kuis</span>
              </h3>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  Judul Kuis: *
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.title}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-blue-600 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  Instruksi / Deskripsi:
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.description}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, description: e.target.value })
                  }
                  placeholder="Petunjuk khusus pengerjaan bagi mahasiswa..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-neutral-700">
                    Batas Waktu (Menit):
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Kosong = Bebas"
                    value={settingsForm.time_limit_minutes}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        time_limit_minutes: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-neutral-700">
                    Ambang Lulus (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={settingsForm.passing_score}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        passing_score: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settingsForm.shuffle_questions}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        shuffle_questions: e.target.checked,
                      })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-neutral-700 font-medium">
                    Acak Urutan Pertanyaan
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settingsForm.shuffle_options}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        shuffle_options: e.target.checked,
                      })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-neutral-700 font-medium">
                    Acak Pilihan Jawaban (A-D)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settingsForm.show_correct_answers_after_submission}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        show_correct_answers_after_submission: e.target.checked,
                      })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-neutral-700 font-medium">
                    Tampilkan Kunci & Penjelasan Pasca Submit
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={settingsForm.is_published}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        is_published: e.target.checked,
                      })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-neutral-900">
                    Publikasikan Kuis ke Mahasiswa
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-neutral-400"
              >
                <Save className="size-3.5" />
                <span>{isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
              </button>
            </form>
          </div>

          {/* ===================================================================
              RIGHT COLUMN: QUESTIONS LIST (2 COLS)
             =================================================================== */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">
                Daftar Pertanyaan ({questions.length})
              </h2>

              <button
                type="button"
                onClick={() => handleOpenQuestionModal()}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                <Plus className="size-3" />
                <span>Tambah Soal</span>
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-neutral-200/90 shadow-sm text-center space-y-3">
                <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center mx-auto">
                  <HelpCircle className="size-6" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">
                  Belum Ada Pertanyaan
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  Tambahkan soal pilihan ganda atau benar/salah untuk melengkapi kuis evaluasi mingguan ini.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenQuestionModal()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Buat Pertanyaan Pertama</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="size-7 rounded-xl bg-neutral-900 text-white text-xs font-extrabold grid place-items-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-neutral-500">
                          {q.question_type === 'single_choice'
                            ? 'Pilihan Ganda Tunggal'
                            : q.question_type === 'multiple_choice'
                            ? 'Pilihan Ganda Kompleks'
                            : 'Benar / Salah'}
                        </span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {q.points} Poin
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenQuestionModal(q)}
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-blue-600 hover:bg-neutral-100 transition cursor-pointer"
                          title="Edit Soal"
                        >
                          <Edit3 className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                          title="Hapus Soal"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-neutral-900">
                      {q.question_text}
                    </p>

                    {/* Options list */}
                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const letter = String.fromCharCode(65 + oIdx);
                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                              opt.is_correct
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                : 'bg-neutral-50/50 border-neutral-200 text-neutral-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-neutral-400">
                                {letter}.
                              </span>
                              <span>{opt.option_text}</span>
                            </div>

                            {opt.is_correct && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Check className="size-3" />
                                <span>Kunci Benar</span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-neutral-500 italic bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                        <span className="font-bold not-italic text-neutral-700">
                          Penjelasan:{' '}
                        </span>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageContainer>

      {/* =======================================================================
          MODAL: ADD / EDIT QUESTION
         ======================================================================= */}
      {isQuestionModalOpen && (
        <Modal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          title={editingQuestion ? 'Edit Pertanyaan Kuis' : 'Tambah Pertanyaan Baru'}
          subtitle={`Kuis: ${quiz.title}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs sm:text-sm">
            {/* Question Text */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                Teks Pertanyaan: *
              </label>
              <textarea
                required
                rows={3}
                value={questionForm.question_text}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, question_text: e.target.value })
                }
                placeholder="Tuliskan pertanyaan evaluasi di sini..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 text-xs sm:text-sm"
              />
            </div>

            {/* Type & Points Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Tipe Pertanyaan:
                </label>
                <select
                  value={questionForm.question_type}
                  onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 text-xs"
                >
                  <option value="single_choice">Pilihan Ganda Tunggal (1 Benar)</option>
                  <option value="multiple_choice">Pilihan Ganda Kompleks (&gt;1 Benar)</option>
                  <option value="true_false">Benar / Salah (True/False)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Bobot Poin:
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={questionForm.points}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      points: parseInt(e.target.value, 10) || 10,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 text-xs font-mono"
                />
              </div>
            </div>

            {/* Answer Options Editor */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Pilihan Jawaban & Kunci Benar: *
                </label>
                {questionForm.question_type !== 'true_false' &&
                  questionForm.options.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="size-3" />
                      <span>Tambah Opsi</span>
                    </button>
                  )}
              </div>

              <div className="space-y-2">
                {questionForm.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl border border-neutral-200 bg-neutral-50/50"
                    >
                      <button
                        type="button"
                        onClick={() => handleOptionCorrectToggle(idx)}
                        className={`size-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 cursor-pointer transition ${
                          opt.is_correct
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-200'
                            : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                        }`}
                        title={
                          opt.is_correct
                            ? 'Kunci Benar (Klik untuk ubah)'
                            : 'Tandai sebagai kunci benar'
                        }
                      >
                        {opt.is_correct ? '✓' : letter}
                      </button>

                      <input
                        type="text"
                        required
                        value={opt.option_text}
                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                        placeholder={`Teks pilihan ${letter}...`}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:border-blue-600 bg-white"
                      />

                      {questionForm.question_type !== 'true_false' &&
                        questionForm.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="p-1 text-neutral-400 hover:text-rose-600 transition cursor-pointer"
                            title="Hapus Opsi"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-neutral-500 italic">
                * Klik huruf tombol di samping kiri untuk menandai pilihan sebagai KUNCI JAWABAN BENAR.
              </p>
            </div>

            {/* Explanation */}
            <div className="space-y-1 pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                Penjelasan / Pembahasan Konsep (Opsional):
              </label>
              <textarea
                rows={2}
                value={questionForm.explanation}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, explanation: e.target.value })
                }
                placeholder="Penjelasan teoritis yang akan ditampilkan kepada mahasiswa setelah kuis disubmit..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 text-xs"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs cursor-pointer disabled:bg-neutral-400"
              >
                {isPending ? 'Menyimpan...' : 'Simpan Pertanyaan'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
