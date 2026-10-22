'use server';

import { createClient } from '@/lib/supabase/server';
import { Lecturer } from '@/types';
import { mockLecturers } from '@/data/lecturers';

/**
 * Server action to fetch public lecturers directory from Supabase.
 * Falls back safely to mockLecturers if database is offline or unpopulated.
 */
export async function getPublicLecturers(): Promise<{
  data: Lecturer[];
  error?: string;
  isLiveDb: boolean;
}> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return { data: mockLecturers, isLiveDb: false };
    }

    const { data, error } = await supabase
      .from('lecturers')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      return {
        data: mockLecturers,
        error: error ? error.message : undefined,
        isLiveDb: false,
      };
    }

    return {
      data: data as Lecturer[],
      isLiveDb: true,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return {
      data: mockLecturers,
      error: msg,
      isLiveDb: false,
    };
  }
}
