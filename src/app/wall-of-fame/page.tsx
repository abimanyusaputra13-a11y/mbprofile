import React from 'react';
import { getPublicAchievements } from '@/lib/actions/achievements';
import { WallOfFameClient } from './WallOfFameClient';

export const metadata = {
  title: 'Wall of Fame - Mahasiswa Berprestasi Departemen MB ITS',
  description:
    'Etalase apresiasi dedikasi, kejuaraan kompetisi, kepemimpinan, serta capaian prestasi terbaik mahasiswa Departemen Manajemen Bisnis ITS.',
};

export const instant = false;

export default async function WallOfFamePage() {
  const { data: achievements, isLiveDb } = await getPublicAchievements();

  return (
    <WallOfFameClient
      initialAchievements={achievements}
      isLiveDb={isLiveDb}
    />
  );
}
