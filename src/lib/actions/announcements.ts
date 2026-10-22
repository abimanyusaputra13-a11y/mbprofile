'use server';

import { connection } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { verifyAdminStatus } from '@/lib/supabase/auth';
import { Announcement } from '@/types';
import { mockAnnouncements } from '@/data/announcements';
import { revalidatePath } from 'next/cache';

export interface AnnouncementInput {
  title: string;
  category: string;
  summary: string;
  content?: string;
  eventDate?: string;
  displayDate?: string;
  isPinned?: boolean;
  linkText?: string;
  linkUrl?: string;
  isPublished?: boolean;
}

/**
 * Fetch public published announcements (pinned first, then latest)
 */
export async function getPublicAnnouncements(limit = 5): Promise<{
  data: Announcement[];
  error?: string;
  isLiveDb: boolean;
}> {
  try {
    await connection();
    const supabase = await createClient();

    if (!supabase) {
      return { data: mockAnnouncements.slice(0, limit), isLiveDb: false };
    }

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return { data: mockAnnouncements.slice(0, limit), isLiveDb: false };
    }

    const mapped: Announcement[] = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      date: item.display_date || new Date(item.event_date || item.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      category: item.category,
      summary: item.summary,
      content: item.content,
      isPinned: Boolean(item.is_pinned),
      linkText: item.link_text || undefined,
      linkUrl: item.link_url || undefined,
      isPublished: item.is_published,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return { data: mapped, isLiveDb: true };
  } catch (err: any) {
    console.error('Error fetching announcements:', err);
    return { data: mockAnnouncements.slice(0, limit), isLiveDb: false, error: err.message };
  }
}

/**
 * Fetch all announcements for admin dashboard
 */
export async function getAdminAnnouncements(): Promise<{
  data: Announcement[];
  error?: string;
}> {
  try {
    await connection();
    const auth = await verifyAdminStatus();
    const adminClient = createAdminClient();
    const supabase = adminClient || (await createClient());

    if (!supabase) {
      return { data: [], error: 'Supabase credentials not configured' };
    }

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    const mapped: Announcement[] = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      date: item.display_date || new Date(item.event_date || item.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      category: item.category,
      summary: item.summary,
      content: item.content,
      isPinned: Boolean(item.is_pinned),
      linkText: item.link_text,
      linkUrl: item.link_url,
      isPublished: item.is_published,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return { data: mapped };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

/**
 * Admin action: create announcement
 */
export async function createAnnouncement(
  input: AnnouncementInput
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await connection();
    const adminClient = createAdminClient();
    const supabase = adminClient || (await createClient());

    if (!supabase) {
      return { success: false, error: 'Database client not available' };
    }

    const eventDate = input.eventDate || new Date().toISOString().split('T')[0];
    const displayDate = input.displayDate || new Date(eventDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title: input.title,
        category: input.category,
        summary: input.summary,
        content: input.content || null,
        event_date: eventDate,
        display_date: displayDate,
        is_pinned: input.isPinned ?? false,
        link_text: input.linkText || null,
        link_url: input.linkUrl || null,
        is_published: input.isPublished ?? true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/announcements');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin action: update announcement
 */
export async function updateAnnouncement(
  id: string,
  input: Partial<AnnouncementInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    await connection();
    const adminClient = createAdminClient();
    const supabase = adminClient || (await createClient());

    if (!supabase) {
      return { success: false, error: 'Database client not available' };
    }

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.title !== undefined) payload.title = input.title;
    if (input.category !== undefined) payload.category = input.category;
    if (input.summary !== undefined) payload.summary = input.summary;
    if (input.content !== undefined) payload.content = input.content;
    if (input.eventDate !== undefined) {
      payload.event_date = input.eventDate;
      payload.display_date = input.displayDate || new Date(input.eventDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    if (input.displayDate !== undefined) payload.display_date = input.displayDate;
    if (input.isPinned !== undefined) payload.is_pinned = input.isPinned;
    if (input.linkText !== undefined) payload.link_text = input.linkText;
    if (input.linkUrl !== undefined) payload.link_url = input.linkUrl;
    if (input.isPublished !== undefined) payload.is_published = input.isPublished;

    const { error } = await supabase
      .from('announcements')
      .update(payload)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/announcements');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin action: toggle pinned status
 */
export async function toggleAnnouncementPin(
  id: string,
  isPinned: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateAnnouncement(id, { isPinned });
}

/**
 * Admin action: toggle published status
 */
export async function toggleAnnouncementPublish(
  id: string,
  isPublished: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateAnnouncement(id, { isPublished });
}

/**
 * Admin action: delete announcement
 */
export async function deleteAnnouncement(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connection();
    const adminClient = createAdminClient();
    const supabase = adminClient || (await createClient());

    if (!supabase) {
      return { success: false, error: 'Database client not available' };
    }

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/announcements');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
