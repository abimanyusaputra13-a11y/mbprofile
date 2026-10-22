import React from 'react';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getWeeklyTopicLearningData } from '@/lib/actions/weeklyLearning';
import { WeeklyLearningClient } from './WeeklyLearningClient';

interface WeeklyTopicPageProps {
  params: Promise<{ id: string; topicId: string }>;
}

export default async function WeeklyTopicPage({ params }: WeeklyTopicPageProps) {
  await connection();
  const { id: courseId, topicId } = await params;

  const data = await getWeeklyTopicLearningData(courseId, topicId);

  if ('error' in data) {
    return notFound();
  }

  return <WeeklyLearningClient initialData={data} />;
}
