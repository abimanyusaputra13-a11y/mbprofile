'use server';

import { connection } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient, createPublicClient } from '@/lib/supabase/server';
import { verifyAdminStatus } from '@/lib/supabase/auth';
import { Achievement, AchievementCategory, AchievementLevel } from '@/types';
import { mockAchievements } from '@/data/achievements';

/**
 * Maps a Supabase row to the Achievement interface
 */
function mapAchievementRow(row: any, photoUrl?: string | null): Achievement {
  return {
    id: row.id,
    title: row.title,
    category: row.category as AchievementCategory,
    level: row.level as AchievementLevel,
    year: Number(row.year) || new Date().getFullYear(),
    award: row.award,
    teamName: row.team_name || undefined,
    members: Array.isArray(row.members) ? row.members : (typeof row.members === 'string' ? [row.members] : []),
    advisor: row.advisor || undefined,
    description: row.description || '',
    eventOrganizer: row.event_organizer || '',
    badgeVariant: row.badge_variant || 'gold',
    certificateStorageKey: row.certificate_storage_key || null,
    photoStorageKey: row.photo_storage_key || null,
    photoUrl: photoUrl || null,
    verificationStatus: row.verification_status || 'PENDING',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Public action: Get verified & approved achievements for Wall of Fame
 */
export async function getPublicAchievements(): Promise<{
  data: Achievement[];
  error?: string;
  isLiveDb: boolean;
}> {
  try {
    const adminClient = createAdminClient();
    const publicClient = createPublicClient();
    const supabase = adminClient || publicClient || (await createClient());

    if (!supabase) {
      return { data: mockAchievements, isLiveDb: false };
    }

    const { data, error } = await supabase
      .from('student_achievements')
      .select('*')
      .eq('verification_status', 'APPROVED')
      .order('year', { ascending: false })
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return { data: mockAchievements, isLiveDb: !error };
    }

    const enriched = await Promise.all(
      data.map(async (row) => {
        let photoUrl: string | null = null;
        if (row.photo_storage_key) {
          try {
            const { data: signData } = await supabase.storage
              .from('course-attachments')
              .createSignedUrl(row.photo_storage_key, 60 * 60 * 24);
            photoUrl = signData?.signedUrl || null;
          } catch {
            photoUrl = null;
          }
        }
        return mapAchievementRow(row, photoUrl);
      })
    );

    return { data: enriched, isLiveDb: true };
  } catch (err: any) {
    console.error('Error fetching public achievements:', err);
    return { data: mockAchievements, error: err.message, isLiveDb: false };
  }
}

/**
 * Public action: Student or team submits a new achievement report
 */
export async function submitAchievementReport(
  formData: FormData
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const title = (formData.get('title') as string || '').trim();
    const category = (formData.get('category') as AchievementCategory) || 'Kompetisi';
    const award = (formData.get('award') as string || '').trim();
    const membersRaw = (formData.get('members') as string || '').trim();
    const eventOrganizer = (formData.get('eventOrganizer') as string || '').trim();
    const description = (formData.get('description') as string || '').trim();
    const teamName = (formData.get('teamName') as string || '').trim();
    const advisor = (formData.get('advisor') as string || '').trim();
    const level = (formData.get('level') as AchievementLevel) || 'Nasional';
    const yearRaw = formData.get('year') as string;
    const year = yearRaw ? parseInt(yearRaw, 10) : new Date().getFullYear();
    const file = formData.get('file') as File | null;
    const photo = formData.get('photo') as File | null;

    if (!title || !award || !membersRaw) {
      return { success: false, error: 'Nama ajang, penghargaan/gelar juara, dan nama mahasiswa wajib diisi.' };
    }

    // Parse members into string array
    const members = membersRaw
      .split(/[,;\n]+/)
      .map((m) => m.trim())
      .filter(Boolean);

    const adminClient = createAdminClient();
    const supabase = adminClient || (await createClient());

    if (!supabase) {
      return { success: false, error: 'Database tidak terhubung.' };
    }

    let certificateStorageKey: string | null = null;
    let photoStorageKey: string | null = null;

    if (file && file.size > 0) {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `certificates/${Date.now()}_${sanitizedName}`;

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { error: uploadError } = await supabase.storage
          .from('course-attachments')
          .upload(storagePath, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: true,
          });

        if (!uploadError) {
          certificateStorageKey = storagePath;
        }
      } catch (uploadEx) {
        console.error('Certificate upload error:', uploadEx);
      }
    }

    if (photo && photo.size > 0) {
      const sanitizedPhotoName = photo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const photoPath = `achievement-photos/${Date.now()}_${sanitizedPhotoName}`;

      try {
        const photoBuffer = Buffer.from(await photo.arrayBuffer());
        const { error: photoUploadError } = await supabase.storage
          .from('course-attachments')
          .upload(photoPath, photoBuffer, {
            contentType: photo.type || 'image/jpeg',
            upsert: true,
          });

        if (!photoUploadError) {
          photoStorageKey = photoPath;
        }
      } catch (photoEx) {
        console.error('Documentation photo upload error:', photoEx);
      }
    }

    // Determine badge variant
    const awardLower = award.toLowerCase();
    let badgeVariant: 'gold' | 'blue' | 'purple' | 'green' = 'gold';
    if (awardLower.includes('silver') || awardLower.includes('2nd') || awardLower.includes('juara 2') || awardLower.includes('runner-up')) {
      badgeVariant = 'blue';
    } else if (awardLower.includes('bronze') || awardLower.includes('3rd') || awardLower.includes('juara 3')) {
      badgeVariant = 'purple';
    }

    const autoDescription = eventOrganizer && eventOrganizer !== title
      ? `Meraih predikat ${award} pada ajang ${title} yang diselenggarakan oleh ${eventOrganizer}.`
      : `Meraih predikat ${award} pada ajang ${title}.`;

    const finalDescription = description.trim() || autoDescription;

    const { data, error: insertError } = await supabase
      .from('student_achievements')
      .insert({
        title,
        category,
        level,
        year,
        award,
        team_name: teamName || null,
        members,
        advisor: advisor || null,
        event_organizer: eventOrganizer || title,
        description: finalDescription,
        certificate_storage_key: certificateStorageKey,
        photo_storage_key: photoStorageKey,
        badge_variant: badgeVariant,
        verification_status: 'PENDING',
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidatePath('/wall-of-fame');
    revalidatePath('/admin/achievements');
    return { success: true, data };
  } catch (err: any) {
    console.error('Error submitting achievement report:', err);
    return { success: false, error: err.message || 'Terjadi kesalahan pada sistem saat mengirim laporan.' };
  }
}

/**
 * Admin action: Fetch all achievements (including PENDING, APPROVED, REJECTED)
 */
export async function getAdminAchievements(): Promise<{
  data: Achievement[];
  error?: string;
}> {
  await connection();
  try {
    const auth = await verifyAdminStatus();
    if (!auth.isAdmin) {
      return { data: [], error: 'Akses terbatas untuk administrator.' };
    }

    const adminClient = createAdminClient();
    const supabase = adminClient || (await createClient());

    if (!supabase) {
      return { data: [], error: 'Supabase client tidak tersedia.' };
    }

    const { data, error } = await supabase
      .from('student_achievements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    const enriched = await Promise.all(
      (data || []).map(async (row) => {
        let photoUrl: string | null = null;
        if (row.photo_storage_key) {
          try {
            const { data: signData } = await supabase.storage
              .from('course-attachments')
              .createSignedUrl(row.photo_storage_key, 60 * 60 * 24);
            photoUrl = signData?.signedUrl || null;
          } catch {
            photoUrl = null;
          }
        }
        return mapAchievementRow(row, photoUrl);
      })
    );

    return { data: enriched };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

/**
 * Admin action: Approve or reject an achievement
 */
export async function reviewAchievement(
  id: string,
  newStatus: 'APPROVED' | 'REJECTED'
): Promise<{ success: boolean; error?: string }> {
  await connection();
  try {
    const auth = await verifyAdminStatus();
    if (!auth.isAdmin) {
      return { success: false, error: 'Akses ditolak.' };
    }

    const adminClient = createAdminClient();
    const supabase = adminClient || (await createClient());

    if (!supabase) {
      return { success: false, error: 'Database tidak tersedia.' };
    }

    const { error } = await supabase
      .from('student_achievements')
      .update({
        verification_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/wall-of-fame');
    revalidatePath('/admin/achievements');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin action: Delete an achievement report
 */
export async function deleteAchievement(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await connection();
  try {
    const auth = await verifyAdminStatus();
    if (!auth.isAdmin) {
      return { success: false, error: 'Akses ditolak.' };
    }

    const adminClient = createAdminClient();
    const supabase = adminClient || (await createClient());

    if (!supabase) {
      return { success: false, error: 'Database tidak tersedia.' };
    }

    const { error } = await supabase
      .from('student_achievements')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/wall-of-fame');
    revalidatePath('/admin/achievements');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Get signed download URL for uploaded certificate
 */
export async function getCertificateDownloadUrl(
  storageKey: string
): Promise<{ url?: string; error?: string }> {
  try {
    if (!storageKey) return { error: 'Berkas tidak ditemukan.' };

    const adminClient = createAdminClient();
    const supabase = adminClient || (await createClient());

    if (!supabase) {
      return { error: 'Database tidak terhubung.' };
    }

    const { data, error } = await supabase.storage
      .from('course-attachments')
      .createSignedUrl(storageKey, 3600);

    if (error || !data) {
      return { error: error?.message || 'Gagal membuat URL unduhan.' };
    }

    return { url: data.signedUrl };
  } catch (err: any) {
    return { error: err.message };
  }
}
