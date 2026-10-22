import React from 'react';
import { getPublicPublishedCourses } from '@/lib/actions/courses';
import { getPublicPublishedMaterials } from '@/lib/actions/materials';
import { getPublicAnnouncements } from '@/lib/actions/announcements';
import { HomePageClient } from './HomePageClient';

export const instant = false;

export default async function HomePage() {
  const [coursesRes, materialsRes, announcementsRes] = await Promise.all([
    getPublicPublishedCourses(),
    getPublicPublishedMaterials(),
    getPublicAnnouncements(4),
  ]);

  return (
    <HomePageClient
      initialCourses={coursesRes.data || []}
      initialMaterials={materialsRes.data || []}
      isLiveCoursesDb={coursesRes.isLiveDb || materialsRes.isLiveDb}
      initialAnnouncements={announcementsRes.data || []}
      isLiveAnnouncementsDb={announcementsRes.isLiveDb}
    />
  );
}

