import React from 'react';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { verifyAdminStatus } from '@/lib/supabase/auth';
import { getAllAdminQuizzes } from '@/lib/actions/weeklyLearning';
import { QuizAdminListClient } from './QuizAdminListClient';

export const metadata = {
  title: 'Kelola Kuis Mingguan - Admin MB ITS',
  description: 'Daftar dan kelola kuis evaluasi mingguan di seluruh mata kuliah',
};

export const instant = false;

export default async function AdminQuizzesListPage() {
  await connection();
  const auth = await verifyAdminStatus();

  if (!auth.isAdmin) {
    redirect('/admin');
  }

  const { data: quizzes, error } = await getAllAdminQuizzes();

  return (
    <PageContainer>
      <QuizAdminListClient initialQuizzes={quizzes || []} error={error} />
    </PageContainer>
  );
}
