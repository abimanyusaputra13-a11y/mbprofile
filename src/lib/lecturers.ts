import { Lecturer } from '@/types';

/**
 * Returns the public image URL for a lecturer's profile photo.
 * Prioritizes the Supabase Storage bucket path, then falls back to original photo source URL.
 */
export function getLecturerPhotoUrl(lecturer: Lecturer): string | null {
  if (lecturer.photo_storage_path) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bhlnebucooffqncaaxpn.supabase.co';
    const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    return `${cleanUrl}/storage/v1/object/public/lecturer-photos/${lecturer.photo_storage_path}`;
  }
  if (lecturer.photo_source_url) {
    return lecturer.photo_source_url;
  }
  if (lecturer.avatarUrl) {
    return lecturer.avatarUrl;
  }
  return null;
}

/**
 * Returns initials from a lecturer's name for fallback monogram.
 */
export function getLecturerInitials(name: string): string {
  if (!name) return 'DS';
  const parts = name
    .split(' ')
    .filter((n) => !n.includes('.') && n.length > 1 && !n.startsWith('(') && !n.endsWith(')'));
  
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return 'DS';
}

/**
 * Normalizes research interests, prioritizing research_interests array and falling back to specializations.
 */
export function getLecturerInterests(lecturer: Lecturer): string[] {
  if (lecturer.research_interests && lecturer.research_interests.length > 0) {
    return lecturer.research_interests;
  }
  return lecturer.specializations || [];
}

/**
 * Returns the primary display title or role badge for a lecturer.
 */
export function getLecturerRoleBadge(lecturer: Lecturer): string {
  return lecturer.position || lecturer.rank || 'Dosen Pengajar';
}
