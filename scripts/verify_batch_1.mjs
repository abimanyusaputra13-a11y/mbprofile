import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = (match[2] || '').trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1]] = val;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const expectedCodes = [
  'DB234101', 'DB234102', 'DB234103', 'DB234104', 'SM234152',
  'DB234105', 'DB234201', 'DB234202', 'DB234203', 'DB234204'
];

async function verifyAll() {
  console.log('=== VERIFIKASI LENGKAP BATCH 1 ===\n');
  let allOk = true;

  for (const code of expectedCodes) {
    const { data: courses, error } = await supabase.from('courses').select('*').eq('code', code);
    if (error || !courses || courses.length === 0) {
      console.error(`ERROR: Course ${code} not found!`);
      allOk = false;
      continue;
    }
    const c = courses[0];
    const { data: topics } = await supabase.from('course_weekly_topics').select('*').eq('course_id', c.id).order('display_order');
    const { data: refs } = await supabase.from('course_references').select('*').eq('course_id', c.id);

    console.log(`[OK] [${c.code}] ${c.name}`);
    console.log(`     Prodi: ${c.study_program} | Sem: ${c.semester} | SKS: ${c.credits}`);
    console.log(`     Deskripsi: ${c.description?.slice(0, 70)}...`);
    console.log(`     Topik: ${topics.length} baris (display_order: ${topics[0]?.display_order} s/d ${topics[topics.length - 1]?.display_order})`);
    if (refs.length > 0) {
      console.log(`     Referensi: "${refs[0].title}" | ${refs[0].author} | Tahun: ${refs[0].publication_year || '-'} | Penerbit: ${refs[0].publisher || '-'}`);
    } else {
      console.log(`     Referensi: -`);
    }

    // Verify sequential display_order
    for (let i = 0; i < topics.length; i++) {
      if (topics[i].display_order !== i + 1) {
        console.error(`     WARN: Topic display_order issue at index ${i}: expected ${i + 1}, got ${topics[i].display_order}`);
        allOk = false;
      }
    }
  }

  // Check preserved attachments
  const { data: attachments } = await supabase.from('course_attachments').select('id, course_id, file_name, weekly_topic_id');
  console.log(`\nPreserved attachments: ${attachments.length} items`);
  for (const a of attachments) {
    console.log(`  Attachment: ${a.file_name} (topic_id: ${a.weekly_topic_id})`);
  }

  // Check preserved weekly materials
  const { data: materials } = await supabase.from('weekly_materials').select('id, course_id, title, weekly_topic_id');
  console.log(`\nPreserved weekly materials: ${materials.length} items`);
  for (const m of materials) {
    console.log(`  Material: ${m.title} (topic_id: ${m.weekly_topic_id})`);
  }

  console.log(`\nStatus Akhir: ${allOk ? 'SEMUA TERVERIFIKASI SEMPURNA (100% OK)' : 'ADA PERINGATAN'}`);
}

verifyAll();
