import React from 'react';
import { getPublicPublishedCourses } from '@/lib/actions/courses';
import { getPublicAnnouncements } from '@/lib/actions/announcements';
import { HomePageClient } from './HomePageClient';

export const instant = false;

export default async function HomePage() {
  const [coursesRes, announcementsRes] = await Promise.all([
    getPublicPublishedCourses(),
    getPublicAnnouncements(4),
  ]);

  return (
    <HomePageClient
      initialCourses={coursesRes.data || []}
      isLiveCoursesDb={coursesRes.isLiveDb}
      initialAnnouncements={announcementsRes.data || []}
      isLiveAnnouncementsDb={announcementsRes.isLiveDb}
    />
  );
}
