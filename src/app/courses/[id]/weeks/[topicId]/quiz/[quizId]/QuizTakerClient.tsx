'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import {
  StudentQuizPayload,
  QuizAttemptResult,
  submitQuizAttempt,
} from '@/lib/actions/weeklyLearning';
import {
  ArrowLeft,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Send,
  Sparkles,
  Info,
} from 'lucide-react';

interface QuizTakerClientProps {
  quiz: StudentQuizPayload;
  courseId: string;
  topicId: string;
}

export function QuizTakerClient({ quiz, courseId, topicId }: QuizTakerClientProps) {
  const [isPending, startTransition] = useTransition();

  // Quiz Stages: 'intro' | 'taking' | 'submitted'
  const [stage, setStage] = useState<'intro' | 'taking' | 'submitted'>('intro');

  // Student Identity
  const [studentName, setStudentName] = useState('');
  const [studentIdentifier, setStudentIdentifier] = useState('');

  // Selected Answers: map of questionId -> array of optionIds
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});

  // Active question navigation index
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Timer
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(
    quiz.time_limit_minutes ? quiz.time_limit_minutes * 60 : null
  );

  // Result state
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    if (stage !== 'taking' || secondsRemaining === null) return;

    if (secondsRemaining <= 0) {
      // Auto-submit when time expires
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, secondsRemaining]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle option selection based on question type
  const handleOptionToggle = (questionId: string, optionId: string, questionType: string) => {
    if (stage !== 'taking') return;

    setSelectedAnswers((prev) => {
      const current = prev[questionId] || [];

      if (questionType === 'multiple_choice') {
        // Toggle in array
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...current, optionId] };
        }
      } else {
        // Single choice or true_false: replace with single item
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const answeredCount = Object.keys(selectedAnswers).filter(
    (qId) => selectedAnswers[qId] && selectedAnswers[qId].length > 0
  ).length;

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setErrorMessage('Silakan isi Nama Lengkap terlebih dahulu.');
      return;
    }
    setErrorMessage(null);
    setStage('taking');
  };

  const handleSubmitQuiz = () => {
    if (isPending) return;

    // Build payload
    const answersPayload = Object.entries(selectedAnswers).map(([qId, optIds]) => ({
      question_id: qId,
      selected_option_ids: optIds,
    }));

    setErrorMessage(null);
    startTransition(async () => {
      const res = await submitQuizAttempt({
        quiz_id: quiz.id,
        student_name: studentName,
        student_identifier: studentIdentifier,
        answers: answersPayload,
      });

      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.data) {
        setResult(res.data);
        setStage('submitted');
      }
    });
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setActiveQuestionIdx(0);
    setSecondsRemaining(quiz.time_limit_minutes ? quiz.time_limit_minutes * 60 : null);
    setResult(null);
    setStage('intro');
  };

  // ===========================================================================
  // RENDER STAGE 1: INTRO / PRE-QUIZ
  // ===========================================================================
  if (stage === 'intro') {
    return (
      <div className="py-10 bg-neutral-50/50 min-h-screen">
        <PageContainer>
          <div className="max-w-2xl mx-auto space-y-6">
            <Link
              href={`/courses/${courseId}/weeks/${topicId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition"
            >
              <ArrowLeft className="size-3.5" />
              <span>Kembali ke Materi Mingguan</span>
            </Link>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand" size="sm">
                    {quiz.weekly_topic
                      ? `Minggu ${quiz.weekly_topic.week_number}`
                      : 'Kuis Mingguan'}
                  </Badge>
                  {quiz.course && (
                    <span className="text-xs text-neutral-500 font-semibold">
                      {quiz.course.name}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  {quiz.title}
                </h1>

                {quiz.description && (
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                    {quiz.description}
                  </p>
                )}
              </div>

              {/* Quiz Rules & Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-neutral-100">
                <div className="p-3 bg-neutral-50 rounded-2xl border border-black/20 text-center space-y-0.5">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                    Total Soal
                  </span>
                  <p className="text-base font-extrabold text-neutral-900">
                    {quiz.question_count}
                  </p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-2xl border border-black/20 text-center space-y-0.5">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                    Total Poin
                  </span>
                  <p className="text-base font-extrabold text-emerald-600">
                    {quiz.total_points}
                  </p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-2xl border border-black/20 text-center space-y-0.5">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                    Waktu
                  </span>
                  <p className="text-base font-extrabold text-neutral-900">
                    {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} Menit` : 'Bebas'}
                  </p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-2xl border border-black/20 text-center space-y-0.5">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                    Ambang Lulus
                  </span>
                  <p className="text-base font-extrabold text-blue-600">
                    {quiz.passing_score}%
                  </p>
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs text-amber-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="size-4 text-amber-600 shrink-0" />
                  <span>Petunjuk Pengerjaan:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-amber-800/90 pl-1">
                  <li>Pastikan Anda telah membaca dan memahami materi teks mingguan.</li>
                  <li>Periksa jenis soal: ada pilihan ganda tunggal, pilihan ganda kompleks, dan benar/salah.</li>
                  <li>Jawaban akan dinilai secara otomatis di server setelah Anda menekan tombol Kirim.</li>
                  <li>Hasil penilaian, skor, dan pembahasan akan langsung ditampilkan.</li>
                </ul>
              </div>

              {/* Student Identity Form */}
              <form onSubmit={handleStartQuiz} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Nama Mahasiswa: *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    NRP / Identitas Mahasiswa (Opsional):
                  </label>
                  <input
                    type="text"
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    placeholder="Contoh: 5025211001"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 text-xs sm:text-sm font-medium font-mono"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs font-semibold text-rose-600 p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                    {errorMessage}
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={quiz.question_count === 0}
                    className="w-full py-3 px-6 rounded-2xl bg-neutral-900 hover:bg-blue-600 disabled:bg-neutral-300 text-white font-extrabold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Mulai Mengerjakan Sekarang</span>
                    <Sparkles className="size-4" />
                  </button>
                  {quiz.question_count === 0 && (
                    <p className="text-center text-xs text-neutral-400 mt-2 italic">
                      Kuis ini belum memiliki daftar pertanyaan dari pengajar.
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // ===========================================================================
  // RENDER STAGE 2: ACTIVE QUIZ TAKING
  // ===========================================================================
  if (stage === 'taking') {
    const currentQuestion = quiz.questions[activeQuestionIdx];
    const isMultiple = currentQuestion?.question_type === 'multiple_choice';
    const isTrueFalse = currentQuestion?.question_type === 'true_false';
    const currentAnswers = selectedAnswers[currentQuestion?.id] || [];

    return (
      <div className="min-h-screen bg-neutral-50/70 pb-24">
        {/* Top Quiz Header with Progress & Timer */}
        <header className="bg-white border-b border-neutral-200 sticky top-16 z-30 shadow-2xs">
          <PageContainer>
            <div className="flex items-center justify-between h-14 gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider truncate">
                  {quiz.title}
                </p>
                <p className="text-xs font-extrabold text-neutral-900">
                  Mahasiswa: <span className="text-blue-600">{studentName}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {secondsRemaining !== null && (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                      secondsRemaining < 120
                        ? 'bg-rose-100 text-rose-700 animate-pulse'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <Clock className="size-3.5" />
                    <span>{formatTimer(secondsRemaining)}</span>
                  </div>
                )}

                <div className="text-xs text-neutral-500 font-semibold hidden sm:block">
                  Terjawab: <span className="text-neutral-900 font-bold">{answeredCount}</span> /{' '}
                  {quiz.question_count}
                </div>
              </div>
            </div>

            {/* Progress bar line */}
            <div className="w-full bg-neutral-100 h-1">
              <div
                className="bg-blue-600 h-1 transition-all duration-300"
                style={{
                  width: `${(answeredCount / Math.max(1, quiz.question_count)) * 100}%`,
                }}
              />
            </div>
          </PageContainer>
        </header>

        {/* Main Quiz Taker Body */}
        <main className="py-8">
          <PageContainer>
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Question Navigation Numbers */}
              <div className="bg-white rounded-2xl p-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between gap-2 overflow-x-auto">
                <span className="text-xs font-bold text-neutral-500 shrink-0 hidden sm:inline">
                  Daftar Soal:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {quiz.questions.map((q, idx) => {
                    const isAnswered =
                      selectedAnswers[q.id] && selectedAnswers[q.id].length > 0;
                    const isCurrent = idx === activeQuestionIdx;

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setActiveQuestionIdx(idx)}
                        className={`size-8 rounded-xl font-bold text-xs flex items-center justify-center transition cursor-pointer shrink-0 ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                            : isAnswered
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-400 font-extrabold'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-300'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Question Card */}
              {currentQuestion ? (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-6">
                  {/* Question Info Bar */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                        Soal {activeQuestionIdx + 1} dari {quiz.question_count}
                      </span>
                      <span className="text-xs text-neutral-400 font-semibold">
                        • {currentQuestion.points} Poin
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-lg border border-black/10">
                      {isMultiple
                        ? 'Pilihan Ganda Kompleks'
                        : isTrueFalse
                        ? 'Benar / Salah'
                        : 'Pilihan Ganda Tunggal'}
                    </span>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-1">
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
                      {currentQuestion.question_text}
                    </h2>
                    {isMultiple && (
                      <p className="text-xs text-blue-600 font-medium italic">
                        * Pilihlah semua jawaban yang Anda anggap benar.
                      </p>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="space-y-3 pt-2">
                    {currentQuestion.options.map((opt, oIdx) => {
                      const isSelected = currentAnswers.includes(opt.id);
                      const letter = String.fromCharCode(65 + oIdx);

                      return (
                        <div
                          key={opt.id}
                          onClick={() =>
                            handleOptionToggle(
                              currentQuestion.id,
                              opt.id,
                              currentQuestion.question_type
                            )
                          }
                          className={`p-4 rounded-2xl border-2 transition-all flex items-start gap-3 cursor-pointer select-none ${
                            isSelected
                              ? 'bg-blue-50 border-black shadow-[4px_4px_0px_0px_#000] -translate-x-0.5 -translate-y-0.5'
                              : 'bg-white border-black/40 hover:border-black hover:shadow-[3px_3px_0px_0px_#000]'
                          }`}
                        >
                          <div
                            className={`size-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition ${
                              isSelected
                                ? 'bg-blue-600 text-white border border-black'
                                : 'bg-neutral-100 text-neutral-600 border border-neutral-300'
                            }`}
                          >
                            {isMultiple ? (isSelected ? '✓' : letter) : letter}
                          </div>

                          <div className="flex-1 pt-0.5">
                            <p
                              className={`text-xs sm:text-sm leading-relaxed ${
                                isSelected
                                  ? 'font-bold text-blue-950'
                                  : 'font-normal text-neutral-800'
                              }`}
                            >
                              {opt.option_text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Next / Previous Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100 gap-3">
                    <button
                      type="button"
                      disabled={activeQuestionIdx === 0}
                      onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
                      className="px-4 py-2 rounded-xl text-xs font-bold border-2 border-black text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      Sebelumnya
                    </button>

                    {activeQuestionIdx < quiz.question_count - 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveQuestionIdx((prev) =>
                            Math.min(quiz.question_count - 1, prev + 1)
                          )
                        }
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-neutral-900 text-white hover:bg-blue-600 transition cursor-pointer border border-black shadow-[2px_2px_0px_0px_#000]"
                      >
                        Selanjutnya
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmitQuiz}
                        disabled={isPending}
                        className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer border border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5"
                      >
                        <Send className="size-3.5" />
                        <span>{isPending ? 'Mengirim...' : 'Kirim Jawaban Kuis'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Submit Final Confirmation Banner */}
              <div className="bg-white rounded-2xl p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-neutral-600">
                  <span className="font-bold text-neutral-900">
                    {answeredCount} dari {quiz.question_count} soal
                  </span>{' '}
                  sudah Anda jawab.
                  {answeredCount < quiz.question_count && (
                    <span className="text-amber-600 font-semibold block sm:inline sm:ml-1">
                      (Masih ada {quiz.question_count - answeredCount} soal kosong)
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-neutral-400 transition cursor-pointer border border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Send className="size-3.5" />
                  <span>{isPending ? 'Memproses Nilai...' : 'Selesai & Kumpulkan'}</span>
                </button>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {errorMessage}
                </div>
              )}
            </div>
          </PageContainer>
        </main>
      </div>
    );
  }

  // ===========================================================================
  // RENDER STAGE 3: RESULTS & SCORE FEEDBACK
  // ===========================================================================
  if (stage === 'submitted' && result) {
    return (
      <div className="py-10 bg-neutral-50/50 min-h-screen">
        <PageContainer>
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Score Summary Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[6px_6px_0px_0px_#000] text-center space-y-4">
              <div className="inline-flex items-center justify-center size-16 rounded-3xl mb-1 shadow-xs ring-4">
                {result.is_passed ? (
                  <div className="size-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center ring-4 ring-emerald-100">
                    <CheckCircle2 className="size-8" />
                  </div>
                ) : (
                  <div className="size-16 rounded-3xl bg-rose-500 text-white flex items-center justify-center ring-4 ring-rose-100">
                    <XCircle className="size-8" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    result.is_passed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {result.is_passed ? 'Lulus Evaluasi' : 'Belum Memenuhi Syarat Kelulusan'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
                  Skor Anda: {result.score} / {result.max_score}
                </h1>
                <p className="text-lg font-bold text-neutral-600">
                  Persentase Nilai: <span className="text-blue-600">{result.percentage}%</span>
                </p>
                <p className="text-xs text-neutral-500">
                  Mahasiswa: <span className="font-bold text-neutral-800">{result.student_name}</span> •
                  Standar Kelulusan: <span className="font-semibold">{result.passing_score}%</span>
                </p>
              </div>

              {/* Feedback text */}
              <div className="p-4 rounded-2xl bg-neutral-50 border-2 border-black/20 text-xs sm:text-sm text-neutral-700 max-w-lg mx-auto">
                {result.feedback}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href={`/courses/${courseId}/weeks/${topicId}`}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold bg-neutral-900 text-white hover:bg-neutral-800 transition border border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Kembali ke Halaman Materi</span>
                </Link>

                <button
                  type="button"
                  onClick={handleRestart}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold border-2 border-black text-neutral-700 hover:bg-neutral-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Coba Lagi Kuis</span>
                </button>
              </div>
            </div>

            {/* Detailed Question Review (if returned by server) */}
            {result.detailed_results && result.detailed_results.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
                  <BookOpen className="size-4 text-blue-600" />
                  <span>Pembahasan dan Evaluasi Jawaban</span>
                </h3>

                <div className="space-y-4">
                  {result.detailed_results.map((q, idx) => {
                    return (
                      <div
                        key={q.question_id}
                        className={`bg-white rounded-3xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-4`}
                      >
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-neutral-500">
                              Soal #{idx + 1}
                            </span>
                            {q.is_correct ? (
                              <Badge variant="green" size="sm">
                                Benar (+{q.awarded_points} Poin)
                              </Badge>
                            ) : (
                              <Badge variant="red" size="sm">
                                Salah (0 / {q.points} Poin)
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm font-bold text-neutral-900">
                          {q.question_text}
                        </p>

                        {/* Options breakdown */}
                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => {
                            const isUserSelected = q.user_selected_ids.includes(opt.id);
                            const isCorrectOpt = q.correct_option_ids.includes(opt.id);
                            const letter = String.fromCharCode(65 + oIdx);

                            let stateClasses = 'bg-neutral-50/50 border-neutral-200 text-neutral-700';
                            if (isCorrectOpt) {
                              stateClasses = 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950';
                            } else if (isUserSelected && !isCorrectOpt) {
                              stateClasses = 'bg-rose-50 border-rose-400 text-rose-950';
                            }

                            return (
                              <div
                                key={opt.id}
                                className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${stateClasses}`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono font-bold text-[11px]">
                                    {letter}.
                                  </span>
                                  <span className="truncate">{opt.option_text}</span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-semibold">
                                  {isUserSelected && (
                                    <span className="px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-800 text-[10px]">
                                      Pilihan Anda
                                    </span>
                                  )}
                                  {isCorrectOpt && (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                                      Kunci Benar
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation note if available */}
                        {q.explanation && (
                          <div className="p-3.5 rounded-2xl bg-blue-50 border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs text-blue-900 space-y-1">
                            <span className="font-bold flex items-center gap-1 text-blue-700">
                              <Sparkles className="size-3.5" />
                              Penjelasan Konsep:
                            </span>
                            <p className="text-neutral-700 leading-relaxed font-normal">
                              {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </PageContainer>
      </div>
    );
  }

  return null;
}
