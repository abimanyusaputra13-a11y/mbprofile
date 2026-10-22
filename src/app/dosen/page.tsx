import React from 'react';
import { cacheLife } from 'next/cache';
import { getPublicLecturers } from '@/lib/actions/lecturers';
import { DaftarDosenClient } from './DaftarDosenClient';

export const metadata = {
  title: 'Direktori Dosen & Minat Riset — Manajemen Bisnis ITS',
  description:
    'Profil resmi jajaran dosen, pimpinan departemen, bidang fokus riset, Google Scholar, dan Scopus Departemen Manajemen Bisnis ITS.',
};

export default async function DaftarDosenPage() {
  'use cache';
  cacheLife('hours');

  const { data: lecturers, isLiveDb, error } = await getPublicLecturers();

  return (
    <DaftarDosenClient
      initialLecturers={lecturers}
      isLiveDb={isLiveDb}
      initialError={error}
    />
  );
}
