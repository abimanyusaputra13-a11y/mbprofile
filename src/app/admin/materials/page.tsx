import React from 'react';
import { connection } from 'next/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { getAdminMaterials } from '@/lib/actions/materials';
import { MaterialManagementClient } from './MaterialManagementClient';

export const metadata = {
  title: 'Kelola Materi & Bank Soal - Admin MB ITS',
};

export default async function AdminMaterialsPage() {
  await connection();
  const { data: materials, error } = await getAdminMaterials();

  return (
    <PageContainer>
      <MaterialManagementClient
        initialMaterials={materials}
        error={error}
      />
    </PageContainer>
  );
}
