import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { getStudentQuiz } from '@/lib/actions/weeklyLearning';
import { QuizTakerClient } from './QuizTakerClient';

export const instant = false;

interface QuizPageProps {
  params: Promise<{
    id: string;
    topicId: string;
    quizId: string;
  }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  await connection();
  const { id: courseId, topicId, quizId } = await params;

  const res = await getStudentQuiz(quizId);

  if (res.error || !res.data) {
    notFound();
  }

  return (
    <QuizTakerClient
      quiz={res.data}
      courseId={courseId}
      topicId={topicId}
    />
  );
}
