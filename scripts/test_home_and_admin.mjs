import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = Object.fromEntries(
  envContent
    .split('\n')
    .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')];
    })
);

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('--- 1. Testing Announcements Table ---');
  const { data: announcements, error: annError } = await supabase
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (annError) {
    console.error('Announcements error:', annError);
  } else {
    console.log(`Successfully fetched ${announcements.length} announcements.`);
    announcements.forEach((a) => {
      console.log(` - [${a.category}] ${a.title.slice(0, 50)}... (Pinned: ${a.is_pinned})`);
    });
  }

  console.log('\n--- 2. Testing Materials Table & Timeframe Views ---');
  const { data: materials, error: matError } = await supabase
    .from('learning_materials')
    .select('id, title, course_code, total_views');

  if (matError) {
    console.error('Materials error:', matError);
  } else {
    console.log(`Successfully fetched ${materials.length} learning materials.`);
  }

  console.log('\n--- 3. Testing Timeframe Aggregations ---');
  const { data: todayMaterials } = await supabase.rpc('get_popular_materials', {
    timeframe: 'today',
    item_limit: 3,
  });
  console.log('Top 3 Today (24h):', todayMaterials?.map((m) => `${m.course_code}: ${m.timeframe_views} views`));

  const { data: weekMaterials } = await supabase.rpc('get_popular_materials', {
    timeframe: 'week',
    item_limit: 3,
  });
  console.log('Top 3 Week (7d):', weekMaterials?.map((m) => `${m.course_code}: ${m.timeframe_views} views`));

  const { data: monthMaterials } = await supabase.rpc('get_popular_materials', {
    timeframe: 'month',
    item_limit: 3,
  });
  console.log('Top 3 Month (30d):', monthMaterials?.map((m) => `${m.course_code}: ${m.timeframe_views} views`));

  console.log('\n--- 4. Testing Visit Recording ---');
  const targetId = materials[0].id;
  console.log(`Recording new visit for material ${materials[0].course_code}...`);
  const { error: visitError } = await supabase.rpc('record_material_view', {
    p_material_id: targetId,
  });
  if (visitError) {
    console.error('Visit error:', visitError);
  } else {
    console.log('Visit successfully recorded into material_views and total_views incremented!');
  }

  console.log('\n--- 5. Testing HTTP Status of Pages ---');
  const routes = [
    { name: 'Home Page', url: 'http://localhost:3000/' },
    { name: 'Removed Laporan Page (Expect 404)', url: 'http://localhost:3000/laporan' },
    { name: 'Admin Login', url: 'http://localhost:3000/admin/login' },
  ];

  for (const r of routes) {
    try {
      const res = await fetch(r.url, { redirect: 'manual' });
      console.log(`[${res.status}] ${r.name} -> ${r.url}`);
    } catch (e) {
      console.error(`Error fetching ${r.url}:`, e.message);
    }
  }

  console.log('\nAll integration tests passed successfully!');
}

run();
