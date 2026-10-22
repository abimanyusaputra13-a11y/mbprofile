import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach((l) => {
  const m = l.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const expectedCodes = [
  'DB234402', 'DB234403', 'DB234404', 'DB234405', 'DB234406',
  'DB234407', 'DB234501', 'DB234502', 'DB234503', 'DB234504'
];

async function verifyAll() {
  console.log('=== VERIFIKASI LENGKAP BATCH 3 ===\n');
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
      console.log(`     Referensi: - (Tidak ada referensi)`);
    }

    // Verify sequential display_order
    for (let i = 0; i < topics.length; i++) {
      if (topics[i].display_order !== i + 1) {
        console.error(`     WARN: Topic display_order issue at index ${i}: expected ${i + 1}, got ${topics[i].display_order}`);
        allOk = false;
      }
    }
  }

  console.log(`\nStatus Akhir: ${allOk ? 'SEMUA TERVERIFIKASI SEMPURNA (100% OK)' : 'ADA PERINGATAN'}`);
}

verifyAll();
