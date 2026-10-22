import React from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { getAdminCourseDetails } from '@/lib/actions/courses';
import { CourseEditorClient } from './CourseEditorClient';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { SecondaryButton } from '@/components/ui/SecondaryButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const { data: course, error } = await getAdminCourseDetails(id);

  if (error || !course) {
    return (
      <PageContainer>
        <div className="py-12 max-w-2xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white">Mata Kuliah Tidak Ditemukan</h1>
          <p className="text-sm text-slate-400">
            {error || 'Mata kuliah yang diminta tidak dapat ditemukan atau database belum terhubung.'}
          </p>
          <div className="pt-4">
            <Link href="/admin">
              <SecondaryButton>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Daftar Mata Kuliah
              </SecondaryButton>
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <CourseEditorClient initialCourse={course} />
    </PageContainer>
  );
}
