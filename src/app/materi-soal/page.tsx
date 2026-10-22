import React from 'react';
import { getPublicPublishedCourses } from '@/lib/actions/courses';
import { MateriDanSoalClient } from './MateriDanSoalClient';

export const instant = false;

export default async function MateriDanSoalPage() {
  const { data: courses, error, isLiveDb } = await getPublicPublishedCourses();

  return (
    <MateriDanSoalClient
      initialCourses={courses}
      initialError={error}
      isLiveDb={isLiveDb}
    />
  );
}
