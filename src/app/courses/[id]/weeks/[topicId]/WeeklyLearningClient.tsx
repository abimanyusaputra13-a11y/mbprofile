'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { Modal } from '@/components/ui/Modal';
import {
  WeeklyLearningPageData,
  saveWeeklyMaterial,
  deleteWeeklyMaterial,
  uploadWeeklyAttachment,
  updateWeeklyAttachment,
  deleteWeeklyAttachment,
  saveWeeklyTopicExtended,
  saveQuizBasic,
  saveQuizQuestion,
  deleteQuizQuestion,
  deleteQuiz,
  getAdminQuizDetails,
  toggleQuizPublishStatus,
} from '@/lib/actions/weeklyLearning';
import {
  WeeklyMaterial,
  CourseAttachment,
  CourseQuiz,
  QuizQuestion,
  QuestionType,
  CourseWeeklyTopic,
} from '@/types/course';
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
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  Layers,
  FileCheck,
  ChevronDown,
  Globe,
  Lock,
  Settings,
  ExternalLink,
  Check,
  X,
} from 'lucide-react';

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

interface WeeklyLearningClientProps {
  initialData: WeeklyLearningPageData;
}

export function WeeklyLearningClient({ initialData }: WeeklyLearningClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { course, allWeeklyTopics, currentTopic, materials: initialMaterials, attachments: initialAttachments, quizzes: initialQuizzes, isAdmin } = initialData;

  const [currentTopicState, setCurrentTopicState] = useState<CourseWeeklyTopic>(currentTopic);
  const [allTopicsState, setAllTopicsState] = useState<CourseWeeklyTopic[]>(allWeeklyTopics);
  const [materials, setMaterials] = useState<WeeklyMaterial[]>(initialMaterials);
  const [attachments, setAttachments] = useState<CourseAttachment[]>(initialAttachments);
  const [quizzes, setQuizzes] = useState<CourseQuiz[]>(initialQuizzes);

  // Topic Editing Modal State
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicForm, setTopicForm] = useState({
    week_number: currentTopic.week_number,
    topic_title: currentTopic.topic_title,
    learning_objectives: currentTopic.learning_objectives || '',
    description: currentTopic.description || '',
    is_published: currentTopic.is_published ?? true,
  });

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

  // Attachment Edit Modal State
  const [isEditAttachmentModalOpen, setIsEditAttachmentModalOpen] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<CourseAttachment | null>(null);
  const [editAttachmentForm, setEditAttachmentForm] = useState({
    file_name: '',
    file_category: 'Slide Dosen',
    is_published: true,
  });
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [isUpdatingAttachment, setIsUpdatingAttachment] = useState(false);

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuizSettings, setEditingQuizSettings] = useState<CourseQuiz | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    time_limit_minutes: '15',
    passing_score: '70',
    max_attempts: '3',
    is_published: true,
  });

  // Question Management States
  const [activeQuizForQuestions, setActiveQuizForQuestions] = useState<CourseQuiz | null>(null);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState(false);
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

  // Handlers for Topic Management
  const handleOpenTopicModal = () => {
    setTopicForm({
      week_number: currentTopicState.week_number,
      topic_title: currentTopicState.topic_title,
      learning_objectives: currentTopicState.learning_objectives || '',
      description: currentTopicState.description || '',
      is_published: currentTopicState.is_published ?? true,
    });
    setIsTopicModalOpen(true);
  };

  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicForm.topic_title.trim() || !topicForm.week_number.trim()) return;

    setStatusMessage(null);
    startTransition(async () => {
      const res = await saveWeeklyTopicExtended({
        id: currentTopicState.id,
        course_id: course.id,
        week_number: topicForm.week_number.trim(),
        topic_title: topicForm.topic_title.trim(),
        learning_objectives: topicForm.learning_objectives.trim() || null,
        description: topicForm.description.trim() || null,
        is_published: topicForm.is_published,
      });

      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else if (res.data) {
        const updated = res.data;
        setCurrentTopicState(updated);
        setAllTopicsState((prev) =>
          prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
        );
        setIsTopicModalOpen(false);
        setStatusMessage({
          type: 'success',
          text: 'Topik pembelajaran mingguan berhasil diperbarui.',
        });
        router.refresh();
      }
    });
  };

  // Handlers for Attachment Edit & Delete
  const handleOpenEditAttachmentModal = (att: CourseAttachment) => {
    setEditingAttachment(att);
    setEditAttachmentForm({
      file_name: att.file_name,
      file_category: att.file_category || 'Slide Dosen',
      is_published: att.is_published ?? true,
    });
    setReplaceFile(null);
    setIsEditAttachmentModalOpen(true);
  };

  const handleSaveEditAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttachment || !editAttachmentForm.file_name.trim()) return;

    setIsUpdatingAttachment(true);
    setStatusMessage(null);

    try {
      let formData: FormData | undefined;
      if (replaceFile) {
        formData = new FormData();
        formData.append('file', replaceFile);
      }

      const res = await updateWeeklyAttachment(
        course.id,
        currentTopicState.id,
        editingAttachment.id,
        {
          file_name: editAttachmentForm.file_name.trim(),
          file_category: editAttachmentForm.file_category,
          is_published: editAttachmentForm.is_published,
        },
        formData
      );

      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else if (res.data) {
        const updated = res.data;
        setAttachments((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a))
        );
        setIsEditAttachmentModalOpen(false);
        setEditingAttachment(null);
        setReplaceFile(null);
        setStatusMessage({
          type: 'success',
          text: `Berkas "${updated.file_name}" berhasil diperbarui.`,
        });
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui berkas.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsUpdatingAttachment(false);
    }
  };

  const handleDeleteAttachment = (id: string, fileName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus berkas "${fileName}"?`)) return;

    setStatusMessage(null);
    startTransition(async () => {
      const res = await deleteWeeklyAttachment(course.id, currentTopicState.id, id);
      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
        setAttachments((prev) => prev.filter((a) => a.id !== id));
        setStatusMessage({
          type: 'success',
          text: `Berkas "${fileName}" berhasil dihapus.`,
        });
        router.refresh();
      }
    });
  };

  // ===========================================================================
  // Handlers for Question Authoring & Management
  // ===========================================================================
  const handleOpenQuestionManager = async (quiz: CourseQuiz) => {
    setActiveQuizForQuestions(quiz);
    setIsLoadingQuestions(true);
    setIsQuestionEditorOpen(false);
    setEditingQuestion(null);
    const res = await getAdminQuizDetails(quiz.id);
    setIsLoadingQuestions(false);
    if (res.data?.questions) {
      setActiveQuizQuestions(res.data.questions);
    } else {
      setActiveQuizQuestions([]);
    }
  };

  const handleOpenAddQuestion = () => {
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
    setIsQuestionEditorOpen(true);
  };

  const handleOpenEditQuestion = (q: QuizQuestion) => {
    setEditingQuestion(q);
    setQuestionForm({
      id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      points: q.points,
      explanation: q.explanation || '',
      options: q.options.map((opt) => ({
        id: opt.id,
        option_text: opt.option_text,
        is_correct: Boolean(opt.is_correct),
        display_order: opt.display_order,
      })),
    });
    setIsQuestionEditorOpen(true);
  };

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
      const hasCorrect = questionForm.options.some((o) => o.is_correct);
      const adjusted = questionForm.options.map((o, idx) => ({
        ...o,
        is_correct: hasCorrect ? (idx === 0 ? true : false) : idx === 0,
      }));
      setQuestionForm((prev) => ({
        ...prev,
        question_type: newType,
        options:
          adjusted.length >= 2
            ? adjusted
            : [
                { option_text: '', is_correct: true, display_order: 0 },
                { option_text: '', is_correct: false, display_order: 1 },
              ],
      }));
    } else {
      setQuestionForm((prev) => ({
        ...prev,
        question_type: newType,
        options:
          prev.options.length >= 2
            ? prev.options
            : [
                { option_text: '', is_correct: true, display_order: 0 },
                { option_text: '', is_correct: false, display_order: 1 },
              ],
      }));
    }
  };

  const handleOptionTextChange = (idx: number, text: string) => {
    setQuestionForm((prev) => {
      const nextOpts = [...prev.options];
      nextOpts[idx].option_text = text;
      return { ...prev, options: nextOpts };
    });
  };

  const handleOptionCorrectToggle = (idx: number) => {
    setQuestionForm((prev) => {
      const nextOpts = [...prev.options];
      if (prev.question_type === 'single_choice' || prev.question_type === 'true_false') {
        return {
          ...prev,
          options: nextOpts.map((opt, i) => ({
            ...opt,
            is_correct: i === idx,
          })),
        };
      } else {
        nextOpts[idx].is_correct = !nextOpts[idx].is_correct;
        return { ...prev, options: nextOpts };
      }
    });
  };

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

  const handleRemoveOption = (idx: number) => {
    if (questionForm.options.length <= 2) return;
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx),
    }));
  };

  const handleSaveQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuizForQuestions) return;

    if (!questionForm.question_text.trim()) {
      alert('Teks soal wajib diisi.');
      return;
    }

    const emptyOpts = questionForm.options.some((o) => !o.option_text.trim());
    if (emptyOpts) {
      alert('Semua teks pilihan jawaban harus diisi.');
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
        quiz_id: activeQuizForQuestions.id,
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
        let updatedList: QuizQuestion[];
        if (editingQuestion) {
          updatedList = activeQuizQuestions.map((q) =>
            q.id === res.data!.id ? res.data! : q
          );
        } else {
          updatedList = [...activeQuizQuestions, res.data!];
        }

        setActiveQuizQuestions(updatedList);
        setIsQuestionEditorOpen(false);
        setEditingQuestion(null);

        const newTotalPoints = updatedList.reduce(
          (sum, q) => sum + (Number(q.points) || 0),
          0
        );

        setQuizzes((prev) =>
          prev.map((q) =>
            q.id === activeQuizForQuestions.id
              ? {
                  ...q,
                  question_count: updatedList.length,
                  total_points: newTotalPoints,
                }
              : q
          )
        );
        setActiveQuizForQuestions((prev) =>
          prev
            ? {
                ...prev,
                question_count: updatedList.length,
                total_points: newTotalPoints,
              }
            : null
        );

        setStatusMessage({
          type: 'success',
          text: `Pertanyaan kuis berhasil ${editingQuestion ? 'diperbarui' : 'disimpan'}.`,
        });
        router.refresh();
      }
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!activeQuizForQuestions) return;
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;

    setStatusMessage(null);
    startTransition(async () => {
      const res = await deleteQuizQuestion(questionId, activeQuizForQuestions.id);
      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
        const updatedList = activeQuizQuestions.filter((q) => q.id !== questionId);
        setActiveQuizQuestions(updatedList);

        const newTotalPoints = updatedList.reduce(
          (sum, q) => sum + (Number(q.points) || 0),
          0
        );

        setQuizzes((prev) =>
          prev.map((q) =>
            q.id === activeQuizForQuestions.id
              ? {
                  ...q,
                  question_count: updatedList.length,
                  total_points: newTotalPoints,
                }
              : q
          )
        );
        setActiveQuizForQuestions((prev) =>
          prev
            ? {
                ...prev,
                question_count: updatedList.length,
                total_points: newTotalPoints,
              }
            : null
        );

        setStatusMessage({ type: 'success', text: 'Soal berhasil dihapus.' });
        router.refresh();
      }
    });
  };

  const handleOpenEditQuizSettings = (quiz: CourseQuiz) => {
    setEditingQuizSettings(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description || '',
      time_limit_minutes: quiz.time_limit_minutes?.toString() || '',
      passing_score: quiz.passing_score.toString(),
      max_attempts: quiz.max_attempts.toString(),
      is_published: quiz.is_published,
    });
    setIsQuizModalOpen(true);
  };

  const handleOpenCreateQuiz = () => {
    setEditingQuizSettings(null);
    setQuizForm({
      title: '',
      description: '',
      time_limit_minutes: '15',
      passing_score: '70',
      max_attempts: '3',
      is_published: true,
    });
    setIsQuizModalOpen(true);
  };

  const handleTogglePublish = async (quizId: string, currentStatus: boolean) => {
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
        if (activeQuizForQuestions?.id === quizId) {
          setActiveQuizForQuestions((prev) =>
            prev
              ? {
                  ...prev,
                  is_published: !currentStatus,
                  status: !currentStatus ? 'published' : 'draft',
                }
              : null
          );
        }
        setStatusMessage({
          type: 'success',
          text: !currentStatus
            ? 'Kuis berhasil dipublikasikan ke publik!'
            : 'Kuis dialihkan menjadi Draf (disembunyikan dari publik).',
        });
        router.refresh();
      }
    });
  };

  const handleDeleteQuizClick = (quiz: CourseQuiz) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus kuis "${quiz.title}" beserta seluruh soalnya?`
      )
    )
      return;

    setStatusMessage(null);
    startTransition(async () => {
      const res = await deleteQuiz(quiz.id, course.id, currentTopic.id);
      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
        setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
        if (activeQuizForQuestions?.id === quiz.id) {
          setActiveQuizForQuestions(null);
        }
        setStatusMessage({ type: 'success', text: 'Kuis berhasil dihapus.' });
        router.refresh();
      }
    });
  };

  // Handlers for Quiz Creation & Settings
  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizForm.title.trim()) return;

    setStatusMessage(null);
    startTransition(async () => {
      const res = await saveQuizBasic({
        id: editingQuizSettings?.id,
        course_id: course.id,
        weekly_topic_id: currentTopic.id,
        title: quizForm.title,
        description: quizForm.description,
        time_limit_minutes: quizForm.time_limit_minutes
          ? parseInt(quizForm.time_limit_minutes, 10)
          : null,
        passing_score: quizForm.passing_score
          ? parseFloat(quizForm.passing_score)
          : 70,
        max_attempts: quizForm.max_attempts
          ? parseInt(quizForm.max_attempts, 10)
          : 3,
        is_published: quizForm.is_published,
      });

      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else if (res.data) {
        const updatedOrNewQuiz: CourseQuiz = {
          ...res.data!,
          question_count: editingQuizSettings
            ? editingQuizSettings.question_count || 0
            : 0,
          total_points: editingQuizSettings
            ? editingQuizSettings.total_points || 0
            : 0,
        };

        if (editingQuizSettings) {
          setQuizzes((prev) =>
            prev.map((q) => (q.id === updatedOrNewQuiz.id ? updatedOrNewQuiz : q))
          );
          setIsQuizModalOpen(false);
          setEditingQuizSettings(null);
          setStatusMessage({
            type: 'success',
            text: 'Pengaturan kuis berhasil diperbarui.',
          });
        } else {
          setQuizzes((prev) => [...prev, updatedOrNewQuiz]);
          setIsQuizModalOpen(false);
          // Directly open Question Manager modal so author can immediately add questions!
          setActiveQuizForQuestions(updatedOrNewQuiz);
          setActiveQuizQuestions([]);
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
          setIsQuestionEditorOpen(true);
          setStatusMessage({
            type: 'success',
            text: 'Kuis berhasil dibuat! Silakan tulis soal pertama di bawah ini.',
          });
        }
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
              {allTopicsState.map((topic) => {
                const isCurrent = topic.id === currentTopicState.id;
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
                  {currentTopicState.week_number.toLowerCase().includes('week')
                    ? currentTopicState.week_number
                    : `Minggu ${currentTopicState.week_number}`}
                </span>
                <span className="text-xs text-neutral-500 font-semibold">
                  {course.name} ({course.code || 'MB'})
                </span>
                {isAdmin && (
                  <Badge variant="brand" size="sm">
                    Mode Pengajar / Admin
                  </Badge>
                )}
                {!currentTopicState.is_published && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Draf Topik
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {currentTopicState.topic_title}
              </h1>

              {(currentTopicState.description || currentTopicState.learning_objectives) && (
                <div className="p-4 rounded-2xl bg-blue-50 border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs text-neutral-700 space-y-1">
                  {currentTopicState.learning_objectives && (
                    <p className="font-semibold text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-blue-600" />
                      <span>Capaian Pembelajaran: {currentTopicState.learning_objectives}</span>
                    </p>
                  )}
                  {currentTopicState.description && (
                    <p className="text-neutral-600 leading-relaxed font-light">
                      {currentTopicState.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Admin Quick Action Controls */}
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-2 shrink-0 self-start">
                <SecondaryButton
                  variant="outline"
                  size="sm"
                  icon={<Edit3 className="size-3.5" />}
                  onClick={handleOpenTopicModal}
                >
                  Edit Topik Ini
                </SecondaryButton>
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
              <div className="p-8 sm:p-12 text-center rounded-3xl bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-3">
                <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center mx-auto border border-black/20">
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
                            ? 'bg-neutral-900 text-white border-black shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-white text-neutral-600 hover:bg-neutral-50 border-neutral-300'
                        }`}
                      >
                        Bagian {idx + 1}: {mat.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Active Material Reader Card */}
                {activeMaterial && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-6">
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
            <div className="bg-white rounded-3xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
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
                      className="p-3.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 bg-white transition space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-bold text-neutral-900 group-hover:text-blue-600 transition truncate" title={att.file_name}>
                              {att.file_name}
                            </p>
                            {!att.is_published && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-full">
                                Draf
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-0.5">
                            {att.file_category} • {formatFileSize(att.file_size_bytes)}
                          </p>
                        </div>

                        {isAdmin && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAttachmentModal(att)}
                              className="p-1.5 text-neutral-600 hover:text-blue-600 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                              title="Edit rincian berkas lampiran"
                            >
                              <Edit3 className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(att.id, att.file_name)}
                              className="p-1.5 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus berkas lampiran"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {att.signedUrl ? (
                        <a
                          href={att.signedUrl}
                          download={att.file_name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition border border-black shadow-[2px_2px_0px_0px_#000]"
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
            <div className="bg-white rounded-3xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Award className="size-4 text-emerald-600" />
                  <span>3. Kuis Evaluasi Mingguan</span>
                </h3>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleOpenCreateQuiz}
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
                      className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Evaluasi Mandiri
                            </span>
                            {quiz.is_published ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Globe className="size-2.5" />
                                <span>Publik</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Lock className="size-2.5" />
                                <span>Draf</span>
                              </span>
                            )}
                          </div>
                          {quiz.time_limit_minutes && (
                            <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                              <Clock className="size-3" />
                              <span>{quiz.time_limit_minutes} Menit</span>
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-neutral-900 mt-1.5">
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
                          <span
                            className={`font-bold ${
                              quiz.question_count && quiz.question_count > 0
                                ? 'text-neutral-900'
                                : 'text-amber-600'
                            }`}
                          >
                            {quiz.question_count || 0} Pertanyaan
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Syarat Kelulusan:</span>
                          <span className="font-bold text-neutral-900">Min. {quiz.passing_score}%</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        {quiz.question_count && quiz.question_count > 0 ? (
                          <Link
                            href={`/courses/${course.id}/weeks/${currentTopic.id}/quiz/${quiz.id}`}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-full text-xs font-bold bg-neutral-900 text-white hover:bg-emerald-600 transition shadow-xs"
                          >
                            <span>Mulai Kerjakan Kuis</span>
                            <ChevronRight className="size-3.5" />
                          </Link>
                        ) : (
                          <div className="w-full py-2 px-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-800 text-[11px] font-medium text-center">
                            {isAdmin
                              ? 'Soal kuis belum ditambahkan. Klik "Buat Soal Kuis" di bawah.'
                              : 'Soal kuis sedang disiapkan oleh pengajar.'}
                          </div>
                        )}

                        {isAdmin && (
                          <div className="space-y-2 pt-1 border-t border-emerald-100/60">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenQuestionManager(quiz)}
                                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                                  !quiz.question_count || quiz.question_count === 0
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300'
                                }`}
                              >
                                <Plus className="size-3.5" />
                                <span>
                                  {!quiz.question_count || quiz.question_count === 0
                                    ? 'Buat Soal Kuis'
                                    : 'Kelola Soal'}
                                </span>
                                {quiz.question_count ? (
                                  <span className="ml-1 px-1.5 py-0.2 bg-neutral-200 text-neutral-800 text-[10px] rounded-full">
                                    {quiz.question_count}
                                  </span>
                                ) : null}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditQuizSettings(quiz)}
                                title="Pengaturan Kuis"
                                className="p-1.5 rounded-xl border border-neutral-300 bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition cursor-pointer"
                              >
                                <Settings className="size-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteQuizClick(quiz)}
                                title="Hapus Kuis"
                                className="p-1.5 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1 pt-0.5">
                              <button
                                type="button"
                                onClick={() => handleTogglePublish(quiz.id, quiz.is_published)}
                                className="hover:underline font-bold text-blue-600 cursor-pointer"
                              >
                                {quiz.is_published ? 'Ubah ke Draf' : 'Publikasikan ke Publik'}
                              </button>

                              <Link
                                href={`/admin/quizzes/${quiz.id}`}
                                target="_blank"
                                className="hover:underline inline-flex items-center gap-1 text-neutral-500"
                              >
                                <span>Editor Penuh</span>
                                <ExternalLink className="size-2.5" />
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
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
          ADMIN MODAL: CREATE OR EDIT QUIZ SETTINGS
         ========================================================================= */}
      {isQuizModalOpen && (
        <Modal
          isOpen={isQuizModalOpen}
          onClose={() => setIsQuizModalOpen(false)}
          title={editingQuizSettings ? 'Pengaturan Kuis' : 'Buat Kuis Evaluasi Baru'}
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

            <div className="pt-2">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-neutral-50/80 cursor-pointer hover:bg-neutral-100 transition">
                <input
                  type="checkbox"
                  checked={quizForm.is_published}
                  onChange={(e) => setQuizForm({ ...quizForm, is_published: e.target.checked })}
                  className="size-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="block font-bold text-xs text-neutral-900">
                    Publikasikan ke Publik
                  </span>
                  <span className="block text-[11px] text-neutral-500">
                    Mahasiswa dapat langsung melihat kuis ini pada materi mingguan.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
              <SecondaryButton variant="outline" size="sm" onClick={() => setIsQuizModalOpen(false)}>
                Batal
              </SecondaryButton>
              <PrimaryButton type="submit" variant="brand" size="sm" disabled={isPending}>
                {isPending
                  ? 'Menyimpan...'
                  : editingQuizSettings
                  ? 'Simpan Pengaturan'
                  : 'Simpan & Buat Soal →'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================================
          ADMIN MODAL: QUESTION BUILDER & MANAGEMENT
         ========================================================================= */}
      {activeQuizForQuestions && (
        <Modal
          isOpen={!!activeQuizForQuestions}
          onClose={() => {
            if (isQuestionEditorOpen) {
              if (confirm('Tutup formulir soal? Perubahan yang belum disimpan akan hilang.')) {
                setIsQuestionEditorOpen(false);
              }
            } else {
              setActiveQuizForQuestions(null);
            }
          }}
          title={
            isQuestionEditorOpen
              ? editingQuestion
                ? 'Edit Pertanyaan Kuis'
                : 'Tambah Pertanyaan Baru'
              : `Kelola Soal: ${activeQuizForQuestions.title}`
          }
          subtitle={`Minggu ${currentTopic.week_number} • ${course.name}`}
          maxWidth="2xl"
        >
          {isLoadingQuestions ? (
            <div className="py-12 text-center text-xs text-neutral-500 space-y-2">
              <div className="inline-block size-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p>Memuat daftar pertanyaan kuis...</p>
            </div>
          ) : isQuestionEditorOpen ? (
            /* ===================================================================
               QUESTION FORM (ADD / EDIT)
               =================================================================== */
            <form onSubmit={handleSaveQuestionSubmit} className="space-y-5 text-xs sm:text-sm">
              {/* Question Type Buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Tipe Pertanyaan:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'single_choice' as QuestionType, label: 'Pilihan Tunggal' },
                    { type: 'multiple_choice' as QuestionType, label: 'Pilihan Berganda' },
                    { type: 'true_false' as QuestionType, label: 'Benar / Salah' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => handleTypeChange(item.type)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                        questionForm.question_type === item.type
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Text & Points */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Teks Pertanyaan / Soal: *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={questionForm.question_text}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, question_text: e.target.value })
                    }
                    placeholder="Tuliskan teks pertanyaan di sini..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 text-xs sm:text-sm"
                  />
                </div>

                <div className="w-40">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Bobot Poin:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={questionForm.points}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        points: parseInt(e.target.value, 10) || 10,
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs"
                  />
                </div>
              </div>

              {/* Options Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Pilihan Jawaban & Kunci: *
                    </label>
                    <p className="text-[11px] text-neutral-500">
                      {questionForm.question_type === 'single_choice' &&
                        'Klik radio untuk memilih 1 jawaban yang benar.'}
                      {questionForm.question_type === 'multiple_choice' &&
                        'Centang satu atau lebih kotak untuk jawaban yang benar.'}
                      {questionForm.question_type === 'true_false' &&
                        'Pilih pernyataan yang benar di antara Benar atau Salah.'}
                    </p>
                  </div>
                  {questionForm.question_type !== 'true_false' &&
                    questionForm.options.length < 6 && (
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="size-3" />
                        <span>Tambah Opsi</span>
                      </button>
                    )}
                </div>

                <div className="space-y-2 pt-1">
                  {questionForm.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition ${
                        opt.is_correct
                          ? 'border-emerald-300 bg-emerald-50/60'
                          : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleOptionCorrectToggle(idx)}
                        title={opt.is_correct ? 'Kunci Jawaban Benar' : 'Jadikan Kunci Jawaban'}
                        className={`size-6 rounded-full flex items-center justify-center shrink-0 transition cursor-pointer border ${
                          opt.is_correct
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                            : 'bg-white border-neutral-300 text-transparent hover:border-emerald-400'
                        }`}
                      >
                        <Check className="size-3.5" />
                      </button>

                      <span className="font-mono font-bold text-xs text-neutral-500 w-5 text-center shrink-0">
                        {String.fromCharCode(65 + idx)}.
                      </span>

                      <input
                        type="text"
                        required
                        disabled={questionForm.question_type === 'true_false'}
                        value={opt.option_text}
                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                        placeholder={`Teks pilihan jawaban ${String.fromCharCode(65 + idx)}...`}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-blue-600 text-xs sm:text-sm bg-white"
                      />

                      {questionForm.question_type !== 'true_false' &&
                        questionForm.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            title="Hapus opsi"
                            className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Pembahasan / Catatan Penjelasan (Opsional):
                </label>
                <textarea
                  rows={2}
                  value={questionForm.explanation}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, explanation: e.target.value })
                  }
                  placeholder="Penjelasan mengapa jawaban tersebut benar untuk mahasiswa..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                <SecondaryButton
                  variant="outline"
                  size="sm"
                  onClick={() => setIsQuestionEditorOpen(false)}
                >
                  Batal
                </SecondaryButton>
                <PrimaryButton type="submit" variant="brand" size="sm" disabled={isPending}>
                  {isPending ? 'Menyimpan...' : 'Simpan Soal'}
                </PrimaryButton>
              </div>
            </form>
          ) : (
            /* ===================================================================
               QUESTIONS LIST VIEW
               =================================================================== */
            <div className="space-y-4">
              {/* Header Stats Bar */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-neutral-900">
                    {activeQuizQuestions.length} Pertanyaan
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="font-bold text-emerald-700">
                    {activeQuizQuestions.reduce(
                      (sum, q) => sum + (Number(q.points) || 0),
                      0
                    )}{' '}
                    Total Poin
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleTogglePublish(
                        activeQuizForQuestions.id,
                        activeQuizForQuestions.is_published
                      )
                    }
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                      activeQuizForQuestions.is_published
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    {activeQuizForQuestions.is_published ? (
                      <>
                        <Globe className="size-3" />
                        <span>Publik (Klik untuk Draf)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="size-3" />
                        <span>Draf (Klik untuk Terbitkan)</span>
                      </>
                    )}
                  </button>

                  <PrimaryButton
                    variant="brand"
                    size="sm"
                    icon={<Plus className="size-3.5" />}
                    onClick={handleOpenAddQuestion}
                  >
                    Tambah Soal
                  </PrimaryButton>
                </div>
              </div>

              {/* Questions List */}
              {activeQuizQuestions.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 space-y-3">
                  <HelpCircle className="size-10 text-neutral-400 mx-auto" />
                  <div>
                    <h4 className="font-bold text-neutral-800 text-sm">
                      Belum Ada Soal Ditambahkan
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                      Kuis ini belum memiliki daftar pertanyaan. Mahasiswa belum dapat mengerjakan
                      kuis sebelum minimal ada 1 soal.
                    </p>
                  </div>
                  <PrimaryButton
                    variant="brand"
                    size="sm"
                    icon={<Plus className="size-3.5" />}
                    onClick={handleOpenAddQuestion}
                  >
                    Buat Pertanyaan Pertama
                  </PrimaryButton>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {activeQuizQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-xs bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-lg">
                            Soal #{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md">
                            {q.question_type === 'single_choice' && 'Pilihan Tunggal'}
                            {q.question_type === 'multiple_choice' && 'Pilihan Berganda'}
                            {q.question_type === 'true_false' && 'Benar / Salah'}
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            {q.points} Poin
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditQuestion(q)}
                            className="p-1.5 rounded-lg text-neutral-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            title="Edit Soal"
                          >
                            <Edit3 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus Soal"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-neutral-900 leading-relaxed">
                        {q.question_text}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={opt.id || optIdx}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border ${
                              opt.is_correct
                                ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 font-semibold'
                                : 'border-neutral-100 bg-neutral-50/50 text-neutral-700'
                            }`}
                          >
                            <span className="font-mono font-bold text-[10px] text-neutral-500 w-4">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span className="flex-1">{opt.option_text}</span>
                            {opt.is_correct && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                <CheckCircle2 className="size-3 text-emerald-600" />
                                <span>Kunci Jawaban</span>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                          <span className="font-bold">Pembahasan: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <p className="text-[11px] text-neutral-400">
                  Perubahan pertanyaan tersimpan langsung ke basis data modul mingguan.
                </p>
                <SecondaryButton
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveQuizForQuestions(null)}
                >
                  Tutup
                </SecondaryButton>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* =========================================================================
          ADMIN MODAL: EDIT WEEKLY TOPIC
         ========================================================================= */}
      {isTopicModalOpen && (
        <Modal
          isOpen={isTopicModalOpen}
          onClose={() => setIsTopicModalOpen(false)}
          title="Edit Topik Mingguan"
          subtitle={`${course.name} (${course.code || 'MB'}) • ${currentTopicState.week_number}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveTopic} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Minggu : *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1 atau Weeks 1–2"
                  value={topicForm.week_number}
                  onChange={(e) => setTopicForm({ ...topicForm, week_number: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Status Akses:
                </label>
                <select
                  value={topicForm.is_published ? 'published' : 'draft'}
                  onChange={(e) => setTopicForm({ ...topicForm, is_published: e.target.value === 'published' })}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 bg-white"
                >
                  <option value="published">Publik (Terbit dan dapat diakses mahasiswa)</option>
                  <option value="draft">Draf Privat (Hanya terlihat oleh Pengajar/Admin)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Judul Topik Pembelajaran: *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Introduction: Organizations, Managers, And Business"
                value={topicForm.topic_title}
                onChange={(e) => setTopicForm({ ...topicForm, topic_title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Capaian Pembelajaran (Learning Objectives):
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Mahasiswa mampu memahami fungsi manajerial dan peran bisnis..."
                value={topicForm.learning_objectives}
                onChange={(e) => setTopicForm({ ...topicForm, learning_objectives: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 leading-relaxed text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Pokok Bahasan / Deskripsi Detail:
              </label>
              <textarea
                rows={4}
                placeholder="Uraian subtopik, materi bahasan, atau instruksi belajar mingguan..."
                value={topicForm.description}
                onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 leading-relaxed text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
              <SecondaryButton
                variant="outline"
                size="sm"
                onClick={() => setIsTopicModalOpen(false)}
              >
                Batal
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                variant="brand"
                size="sm"
                disabled={isPending}
              >
                {isPending ? 'Menyimpan...' : 'Simpan Perubahan Topik'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================================
          ADMIN MODAL: EDIT ATTACHMENT
         ========================================================================= */}
      {isEditAttachmentModalOpen && editingAttachment && (
        <Modal
          isOpen={isEditAttachmentModalOpen}
          onClose={() => {
            setIsEditAttachmentModalOpen(false);
            setEditingAttachment(null);
            setReplaceFile(null);
          }}
          title="Edit Berkas Lampiran"
          subtitle={`Minggu ${currentTopicState.week_number} • ${course.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveEditAttachment} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Nama Tampilan Berkas: *
              </label>
              <input
                type="text"
                required
                value={editAttachmentForm.file_name}
                onChange={(e) => setEditAttachmentForm({ ...editAttachmentForm, file_name: e.target.value })}
                placeholder="Contoh: Slide Perkuliahan Pertemuan 1.pdf"
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Kategori Berkas:
                </label>
                <select
                  value={editAttachmentForm.file_category}
                  onChange={(e) => setEditAttachmentForm({ ...editAttachmentForm, file_category: e.target.value })}
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Status Akses:
                </label>
                <select
                  value={editAttachmentForm.is_published ? 'published' : 'draft'}
                  onChange={(e) => setEditAttachmentForm({ ...editAttachmentForm, is_published: e.target.value === 'published' })}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 bg-white"
                >
                  <option value="published">Publik (Dapat diunduh)</option>
                  <option value="draft">Draf Privat (Akses Pengajar)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Ganti Berkas Fisik (Opsional):
              </label>
              <input
                type="file"
                onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                className="w-full p-2 rounded-xl border border-neutral-300 bg-neutral-50 text-xs"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Pilih file baru jika ingin menimpa berkas yang tersimpan saat ini ({formatFileSize(editingAttachment.file_size_bytes)}). Kosongkan jika hanya mengubah nama atau kategori.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
              <SecondaryButton
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditAttachmentModalOpen(false);
                  setEditingAttachment(null);
                  setReplaceFile(null);
                }}
              >
                Batal
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                variant="brand"
                size="sm"
                disabled={isUpdatingAttachment}
              >
                {isUpdatingAttachment ? 'Menyimpan...' : 'Simpan Perubahan Berkas'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
