import React from 'react';
import { cacheLife } from 'next/cache';
import { getPublicAchievements } from '@/lib/actions/achievements';
import { WallOfFameClient } from './WallOfFameClient';

export const metadata = {
  title: 'Wall of Fame - Mahasiswa Berprestasi Departemen MB ITS',
  description:
    'Etalase apresiasi dedikasi, kejuaraan kompetisi, kepemimpinan, serta capaian prestasi terbaik mahasiswa Departemen Manajemen Bisnis ITS.',
};

export default async function WallOfFamePage() {
  'use cache';
  cacheLife('hours');

  const { data: achievements, isLiveDb } = await getPublicAchievements();

  return (
    <WallOfFameClient
      initialAchievements={achievements}
      isLiveDb={isLiveDb}
    />
  );
}
