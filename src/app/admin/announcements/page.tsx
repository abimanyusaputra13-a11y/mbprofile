import React from 'react';
import { connection } from 'next/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { getAdminAnnouncements } from '@/lib/actions/announcements';
import { AnnouncementManagementClient } from './AnnouncementManagementClient';

export const metadata = {
  title: 'Kelola Pengumuman & Agenda - Admin MB ITS',
};

export default async function AdminAnnouncementsPage() {
  await connection();
  const { data: announcements, error } = await getAdminAnnouncements();

  return (
    <PageContainer>
      <AnnouncementManagementClient
        initialAnnouncements={announcements}
        error={error}
      />
    </PageContainer>
  );
}
