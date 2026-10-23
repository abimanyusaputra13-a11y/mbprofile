import { connection } from 'next/server';
import { notFound, redirect } from 'next/navigation';
import { verifyAdminStatus } from '@/lib/supabase/auth';
import { getAdminQuizDetails } from '@/lib/actions/weeklyLearning';
import { QuizEditorClient } from './QuizEditorClient';

interface AdminQuizPageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export const instant = false;

export default async function AdminQuizPage({ params }: AdminQuizPageProps) {
  await connection();
  const auth = await verifyAdminStatus();

  if (!auth.isAdmin) {
    redirect('/admin');
  }

  const { quizId } = await params;
  const res = await getAdminQuizDetails(quizId);

  if (res.error || !res.data) {
    notFound();
  }

  return <QuizEditorClient initialQuiz={res.data} />;
}
