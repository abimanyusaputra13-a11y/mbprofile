'use server';

import { connection } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { verifyAdminStatus } from '@/lib/supabase/auth';
import { Resource, TimeframeFilter } from '@/types';
import { mockResources } from '@/data/resources';
import { revalidatePath } from 'next/cache';

export interface MaterialInput {
  title: string;
  courseCode: string;
  courseName: string;
  semester: number;
  type: string;
  academicYear: string;
  fileFormat: string;
  fileSize: string;
  author: string;
  description: string;
  sampleUrl?: string;
  tags: string[];
  isPublished?: boolean;
}

export interface AdminMaterialItem extends Resource {
  viewsToday: number;
  viewsWeek: number;
  viewsMonth: number;
}

/**
 * Fetch popular materials filtered and sorted by visit count in a timeframe.
 * Real-time integrated with Supabase.
 */
export async function getPopularMaterials(
  timeframe: TimeframeFilter = 'all',
  limit = 6
): Promise<{ data: Resource[]; error?: string; isLiveDb: boolean }> {
  try {
    await connection();
    const supabase = await createClient();

    if (!supabase) {
      return {
        data: getMockPopularMaterials(timeframe, limit),
        isLiveDb: false,
      };
    }

    // Try calling the RPC function
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_popular_materials', {
      timeframe,
      item_limit: limit,
    });

    if (!rpcError && rpcData && rpcData.length > 0) {
      const resources: Resource[] = rpcData.map((row: any) => ({
        id: row.id,
        title: row.title,
        courseCode: row.course_code,
        courseName: row.course_name,
        semester: row.semester,
        type: row.type as any,
        academicYear: row.academic_year,
        fileFormat: row.file_format as any,
        fileSize: row.file_size,
        uploadedAt: new Date(row.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        downloadCount: row.download_count,
        total_views: row.total_views,
        timeframe_views: Number(row.timeframe_views || 0),
        author: row.author,
        description: row.description,
        sampleUrl: row.sample_url || '',
        tags: Array.isArray(row.tags) ? row.tags : [],
        is_published: row.is_published,
      }));

      return { data: resources, isLiveDb: true };
    }

    // Direct fallback query if RPC isn't available
    const { data: rawMaterials, error: matError } = await supabase
      .from('learning_materials')
      .select('*')
      .eq('is_published', true)
      .order('total_views', { ascending: false })
      .limit(limit);

    if (matError || !rawMaterials || rawMaterials.length === 0) {
      return {
        data: getMockPopularMaterials(timeframe, limit),
        isLiveDb: false,
      };
    }

    const mapped: Resource[] = rawMaterials.map((row: any) => ({
      id: row.id,
      title: row.title,
      courseCode: row.course_code,
      courseName: row.course_name,
      semester: row.semester,
      type: row.type as any,
      academicYear: row.academic_year,
      fileFormat: row.file_format as any,
      fileSize: row.file_size,
      uploadedAt: new Date(row.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      downloadCount: row.download_count,
      total_views: row.total_views,
      timeframe_views: row.total_views,
      author: row.author,
      description: row.description,
      sampleUrl: row.sample_url || '',
      tags: Array.isArray(row.tags) ? row.tags : [],
      is_published: row.is_published,
    }));

    return { data: mapped, isLiveDb: true };
  } catch (err: any) {
    console.error('Error fetching popular materials:', err);
    return {
      data: getMockPopularMaterials(timeframe, limit),
      error: err.message,
      isLiveDb: false,
    };
  }
}

/**
 * Record a visit to a material in real time
 */
export async function recordMaterialVisit(materialId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const adminClient = createAdminClient();
    const supabase = adminClient || (await createClient());

    if (!supabase) {
      return { success: true }; // Local simulated success
    }

    // Try RPC
    const { error: rpcError } = await supabase.rpc('record_material_view', {
      p_material_id: materialId,
    });

    if (rpcError) {
      // Manual fallback
      await supabase.from('material_views').insert({
        material_id: materialId,
        viewed_at: new Date().toISOString(),
      });
      
      const { data: current } = await supabase
        .from('learning_materials')
        .select('total_views')
        .eq('id', materialId)
        .single();
      
      if (current) {
        await supabase
          .from('learning_materials')
          .update({ total_views: (current.total_views || 0) + 1 })
          .eq('id', materialId);
      }
    }

    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Error recording material visit:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all materials with timeframe analytics for Admin
 */
export async function getAdminMaterials(): Promise<{ data: AdminMaterialItem[]; error?: string }> {
  try {
    await connection();
    const auth = await verifyAdminStatus();
    const adminClient = createAdminClient();
    const supabase = adminClient || (await createClient());

    if (!supabase) {
      return { data: [], error: 'Supabase credentials not configured' };
    }

    // Query materials
    const { data: materials, error: matError } = await supabase
      .from('learning_materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (matError) {
      return { data: [], error: matError.message };
    }

    // Query views in past 30 days
    const past30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const past7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const past24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: viewsData } = await supabase
      .from('material_views')
      .select('material_id, viewed_at')
      .gte('viewed_at', past30Days);

    const viewsList = viewsData || [];

    const result: AdminMaterialItem[] = (materials || []).map((m: any) => {
      const matViews = viewsList.filter((v: any) => v.material_id === m.id);
      const viewsToday = matViews.filter((v: any) => v.viewed_at >= past24Hours).length;
      const viewsWeek = matViews.filter((v: any) => v.viewed_at >= past7Days).length;
      const viewsMonth = matViews.length;

      return {
        id: m.id,
        title: m.title,
        courseCode: m.course_code,
        courseName: m.course_name,
        semester: m.semester,
        type: m.type as any,
        academicYear: m.academic_year,
        fileFormat: m.file_format as any,
        fileSize: m.file_size,
        uploadedAt: new Date(m.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        downloadCount: m.download_count,
        total_views: m.total_views,
        viewsToday,
        viewsWeek,
        viewsMonth,
        author: m.author,
        description: m.description,
        sampleUrl: m.sample_url || '',
        tags: Array.isArray(m.tags) ? m.tags : [],
        is_published: m.is_published,
      };
    });

    return { data: result };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

/**
 * Admin action: create a new learning material
 */
export async function createMaterial(input: MaterialInput): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await connection();
    const adminClient = createAdminClient();
    const supabase = adminClient || (await createClient());

    if (!supabase) {
      return { success: false, error: 'Database client not available' };
    }

    const { data, error } = await supabase
      .from('learning_materials')
      .insert({
        title: input.title,
        course_code: input.courseCode,
        course_name: input.courseName,
        semester: input.semester,
        type: input.type,
        academic_year: input.academicYear,
        file_format: input.fileFormat,
        file_size: input.fileSize,
        author: input.author,
        description: input.description,
        sample_url: input.sampleUrl || '',
        tags: input.tags,
        is_published: input.isPublished ?? true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/materi-soal');
    revalidatePath('/admin/materials');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin action: update an existing material
 */
export async function updateMaterial(
  id: string,
  input: Partial<MaterialInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    await connection();
    const adminClient = createAdminClient();
    const supabase = adminClient || (await createClient());

    if (!supabase) {
      return { success: false, error: 'Database client not available' };
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.title !== undefined) updatePayload.title = input.title;
    if (input.courseCode !== undefined) updatePayload.course_code = input.courseCode;
    if (input.courseName !== undefined) updatePayload.course_name = input.courseName;
    if (input.semester !== undefined) updatePayload.semester = input.semester;
    if (input.type !== undefined) updatePayload.type = input.type;
    if (input.academicYear !== undefined) updatePayload.academic_year = input.academicYear;
    if (input.fileFormat !== undefined) updatePayload.file_format = input.fileFormat;
    if (input.fileSize !== undefined) updatePayload.file_size = input.fileSize;
    if (input.author !== undefined) updatePayload.author = input.author;
    if (input.description !== undefined) updatePayload.description = input.description;
    if (input.sampleUrl !== undefined) updatePayload.sample_url = input.sampleUrl;
    if (input.tags !== undefined) updatePayload.tags = input.tags;
    if (input.isPublished !== undefined) updatePayload.is_published = input.isPublished;

    const { error } = await supabase
      .from('learning_materials')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/materi-soal');
    revalidatePath('/admin/materials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin action: delete a material
 */
export async function deleteMaterial(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connection();
    const adminClient = createAdminClient();
    const supabase = adminClient || (await createClient());

    if (!supabase) {
      return { success: false, error: 'Database client not available' };
    }

    const { error } = await supabase
      .from('learning_materials')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/materi-soal');
    revalidatePath('/admin/materials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin action: add simulated visits for testing timeframe popularity
 */
export async function addSimulatedVisits(
  materialId: string,
  timeframe: 'today' | 'week' | 'month',
  count: number = 5
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminClient = createAdminClient();
    if (!adminClient) return { success: false, error: 'Admin client not available' };

    const records = [];
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      let offsetMs = 0;
      if (timeframe === 'today') {
        offsetMs = Math.random() * (20 * 60 * 60 * 1000); // within last 20 hours
      } else if (timeframe === 'week') {
        offsetMs = 24 * 60 * 60 * 1000 + Math.random() * (5 * 24 * 60 * 60 * 1000); // 1-6 days ago
      } else {
        offsetMs = 8 * 24 * 60 * 60 * 1000 + Math.random() * (20 * 24 * 60 * 60 * 1000); // 8-28 days ago
      }

      records.push({
        material_id: materialId,
        viewed_at: new Date(now - offsetMs).toISOString(),
      });
    }

    await adminClient.from('material_views').insert(records);

    const { data: mat } = await adminClient
      .from('learning_materials')
      .select('total_views')
      .eq('id', materialId)
      .single();

    if (mat) {
      await adminClient
        .from('learning_materials')
        .update({ total_views: (mat.total_views || 0) + count })
        .eq('id', materialId);
    }

    revalidatePath('/');
    revalidatePath('/admin/materials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Helper mock fallback
function getMockPopularMaterials(timeframe: TimeframeFilter, limit: number): Resource[] {
  // Sort differently depending on timeframe for realistic demonstration
  const cloned = [...mockResources];
  if (timeframe === 'today') {
    // BD1201 leading today
    cloned.sort((a, b) => (b.courseCode === 'BD1201' ? 1 : -1));
  } else if (timeframe === 'week') {
    // MB1202 leading this week
    cloned.sort((a, b) => (b.courseCode === 'MB1202' ? 1 : -1));
  } else if (timeframe === 'month') {
    // MB1201 leading this month
    cloned.sort((a, b) => (b.courseCode === 'MB1201' ? 1 : -1));
  } else {
    // All time
    cloned.sort((a, b) => b.downloadCount - a.downloadCount);
  }

  return cloned.slice(0, limit).map((r, idx) => ({
    ...r,
    total_views: r.downloadCount * 4 + 100,
    timeframe_views: Math.max(10, Math.floor((r.downloadCount * 4) / (idx + 1))),
  }));
}
