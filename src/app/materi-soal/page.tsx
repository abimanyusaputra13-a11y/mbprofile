import React from 'react';
import { getPublicPublishedCourses } from '@/lib/actions/courses';
import { getPublicPublishedMaterials } from '@/lib/actions/materials';
import { MateriDanSoalClient } from './MateriDanSoalClient';

export const instant = false;

export default async function MateriDanSoalPage() {
  const [coursesRes, materialsRes] = await Promise.all([
    getPublicPublishedCourses(),
    getPublicPublishedMaterials(),
  ]);

  return (
    <MateriDanSoalClient
      initialCourses={coursesRes.data || []}
      initialMaterials={materialsRes.data || []}
      initialError={coursesRes.error || materialsRes.error}
      isLiveDb={coursesRes.isLiveDb || materialsRes.isLiveDb}
    />
  );
}

