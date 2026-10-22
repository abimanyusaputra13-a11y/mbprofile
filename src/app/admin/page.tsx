import React from 'react';
import { connection } from 'next/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { getAdminCourses } from '@/lib/actions/courses';
import { CourseListClient } from './CourseListClient';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export const instant = false;

export default async function AdminDashboardPage() {
  await connection();
  const isConfigured = isSupabaseConfigured();
  const { data: courses, error } = await getAdminCourses();

  return (
    <PageContainer>
      <CourseListClient
        initialCourses={courses}
        error={error}
        isConfigured={isConfigured}
      />
    </PageContainer>
  );
}
