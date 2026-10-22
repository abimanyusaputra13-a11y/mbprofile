import React from 'react';
import { connection } from 'next/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { getAdminAchievements } from '@/lib/actions/achievements';
import { AchievementManagementClient } from './AchievementManagementClient';

export const metadata = {
  title: 'Kurasi Prestasi Mahasiswa - Admin MB ITS',
  description: 'Panel moderasi dan persetujuan pengajuan prestasi mahasiswa Departemen Manajemen Bisnis ITS',
};

export const instant = false;

export default async function AdminAchievementsPage() {
  await connection();
  const { data: achievements, error } = await getAdminAchievements();

  return (
    <PageContainer>
      <AchievementManagementClient
        initialAchievements={achievements}
        error={error}
      />
    </PageContainer>
  );
}
