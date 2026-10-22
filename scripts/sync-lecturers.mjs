import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to load .env.local if not already provided
function loadEnv() {
  const envPath = path.join(rootDir, '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const OFFICIAL_URL = 'https://www.its.ac.id/mb/dosen-staff/daftar-dosen/';
const STORAGE_BUCKET = 'lecturer-photos';

function decodeHtmlEntities(str) {
  if (!str) return str;
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchOfficialDirectory() {
  console.log(`[1/4] Mengambil data dari web resmi ITS:\n      ${OFFICIAL_URL}...`);
  const response = await fetch(OFFICIAL_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Gagal mengunduh halaman: HTTP ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  console.log(`      Berhasil diunduh (${html.length.toLocaleString()} bytes).`);
  return html;
}

function parseLecturersFromHtml(html) {
  console.log('[2/4] Mengekstrak data profil dosen...');
  const chunks = html.split('<div class="its-row its-row-grid');
  const extracted = [];

  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (!chunk.includes('its-rich-content') || !chunk.includes('its-image-frame')) {
      continue;
    }

    // Photo URL
    const imgMatch = chunk.match(/<figure[^>]*class="its-image-frame[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^">]+)"/i);
    let photoUrl = imgMatch ? decodeHtmlEntities(imgMatch[1]) : null;

    // Highest quality image from srcset if available
    const srcsetMatch = chunk.match(/srcset="([^"]+)"/i);
    if (srcsetMatch) {
      const parts = srcsetMatch[1].split(',').map(s => s.trim().split(' '));
      const cleanImg = parts.find(p => !p[0].includes('-150x150') && !p[0].includes('-300x300') && !p[0].includes('-320x320'));
      if (cleanImg && cleanImg[0]) {
        photoUrl = decodeHtmlEntities(cleanImg[0]);
      }
    }

    // Rich content container
    const richMatch = chunk.match(/<div class="its-rich-content[^>]*>([\s\S]*?)<\/div>/i);
    const rich = richMatch ? richMatch[1] : '';

    // Name & Link
    let name = '';
    let detailPageUrl = null;
    const nameLinkMatch = rich.match(/<h5[^>]*>\s*<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h5>/i);
    if (nameLinkMatch) {
      detailPageUrl = decodeHtmlEntities(nameLinkMatch[1]);
      name = decodeHtmlEntities(nameLinkMatch[2].replace(/<[^>]+>/g, '')).trim();
    } else {
      const h5Match = rich.match(/<h5[^>]*>([\s\S]*?)<\/h5>/i);
      if (h5Match) {
        name = decodeHtmlEntities(h5Match[1].replace(/<[^>]+>/g, '')).trim();
      }
    }

    if (!name) continue;

    // NIP
    let nip = null;
    const nipMatch = rich.match(/NIP\.?\s*([0-9\s]+)/i);
    if (nipMatch) {
      nip = nipMatch[1].replace(/\s+/g, '').trim();
    }

    // Position / Department Role (e.g. "(Kepala Departemen)")
    let position = null;
    const posMatch = rich.match(/<h5>\s*\(([^)]+)\)\s*<\/h5>/i);
    if (posMatch) {
      position = decodeHtmlEntities(posMatch[1]).trim();
    }

    // Research interests
    const interests = [];
    const ulMatch = rich.match(/<ul>([\s\S]*?)<\/ul>/i);
    if (ulMatch) {
      const lis = [...ulMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
      for (const li of lis) {
        const item = decodeHtmlEntities(li[1].replace(/<[^>]+>/g, ''))
          .replace(/\s+/g, ' ')
          .trim();
        if (item && !interests.includes(item)) {
          interests.push(item);
        }
      }
    }

    // Google Scholar & Scopus
    let googleScholar = null;
    const scholarMatch = rich.match(/href="([^"]*scholar\.google[^"]*)"/i);
    if (scholarMatch) {
      googleScholar = decodeHtmlEntities(scholarMatch[1]);
    }

    let scopus = null;
    const scopusMatch = rich.match(/href="([^"]*scopus\.com[^"]*)"/i);
    if (scopusMatch) {
      scopus = decodeHtmlEntities(scopusMatch[1]);
    }

    extracted.push({
      name,
      normalized_name: normalizeName(name),
      nip,
      position,
      photo_source_url: photoUrl,
      research_interests: interests,
      google_scholar_url: googleScholar,
      scopus_url: scopus,
      detail_page_url: detailPageUrl,
      source_url: OFFICIAL_URL
    });
  }

  console.log(`      Ditemukan ${extracted.length} profil dosen terverifikasi.`);
  return extracted;
}

async function uploadLecturerPhoto(lecturerId, photoSourceUrl) {
  if (!photoSourceUrl) return null;

  try {
    const res = await fetch(photoSourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!res.ok) {
      console.warn(`      [WARN] Gagal download foto (${res.status}): ${photoSourceUrl}`);
      return null;
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await res.arrayBuffer());

    // Validate size (max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      console.warn(`      [WARN] Ukuran foto melebihi batas 5MB: ${buffer.length} bytes`);
      return null;
    }

    let ext = 'jpg';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('webp')) ext = 'webp';

    const storagePath = `lecturers/${lecturerId}/profile.${ext}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.warn(`      [WARN] Gagal upload ke storage (${storagePath}):`, error.message);
      return null;
    }

    return storagePath;
  } catch (err) {
    console.warn(`      [WARN] Error saat memproses foto ${photoSourceUrl}:`, err.message);
    return null;
  }
}

async function syncAll() {
  const startTime = Date.now();
  console.log('================================================================');
  console.log('  MB-ITS LECTURER PROFILE & RESEARCH INTERESTS SYNCHRONIZER');
  console.log('================================================================');

  // 1. Fetch & Parse
  const html = await fetchOfficialDirectory();
  const extractedList = parseLecturersFromHtml(html);

  // 2. Fetch existing from Supabase
  console.log('[3/4] Membaca data dosen yang ada di database Supabase...');
  const { data: existingLecturers, error: fetchError } = await supabase
    .from('lecturers')
    .select('*');

  if (fetchError) {
    throw new Error(`Gagal membaca tabel lecturers: ${fetchError.message}`);
  }

  const existingMapByNip = new Map();
  const existingMapByName = new Map();

  for (const lec of (existingLecturers || [])) {
    if (lec.nip) existingMapByNip.set(lec.nip, lec);
    existingMapByName.set(lec.normalized_name, lec);
  }

  console.log(`      Ditemukan ${existingLecturers ? existingLecturers.length : 0} data tersimpan di Supabase.`);

  // 3. Process & Upsert
  console.log('[4/4] Melakukan sinkronisasi data dan foto profil...');
  let inserted = 0;
  let updated = 0;
  let unchanged = 0;
  let photosUploaded = 0;
  const failed = [];
  const processedNips = new Set();
  const processedNames = new Set();

  for (const item of extractedList) {
    try {
      // Find existing record
      const existing = (item.nip && existingMapByNip.get(item.nip)) || existingMapByName.get(item.normalized_name);
      const isNew = !existing;
      const targetId = existing ? existing.id : undefined;

      // Handle photo upload if needed
      let photoStoragePath = existing ? existing.photo_storage_path : null;

      // If missing storage path or photo source changed, download & upload
      const shouldUploadPhoto = !photoStoragePath || (existing && existing.photo_source_url !== item.photo_source_url);

      // Determine fields to update or insert
      const recordData = {
        name: item.name,
        normalized_name: item.normalized_name,
        nip: item.nip || (existing ? existing.nip : null),
        position: item.position || (existing ? existing.position : null),
        photo_source_url: item.photo_source_url || (existing ? existing.photo_source_url : null),
        research_interests: item.research_interests.length > 0 ? item.research_interests : (existing ? existing.research_interests : []),
        google_scholar_url: item.google_scholar_url || (existing ? existing.google_scholar_url : null),
        scopus_url: item.scopus_url || (existing ? existing.scopus_url : null),
        detail_page_url: item.detail_page_url || (existing ? existing.detail_page_url : null),
        source_url: item.source_url,
        last_synced_at: new Date().toISOString()
      };

      if (isNew) {
        // Insert new record
        const { data: insertedRecord, error: insertError } = await supabase
          .from('lecturers')
          .insert(recordData)
          .select()
          .single();

        if (insertError) {
          throw new Error(`Gagal insert: ${insertError.message}`);
        }

        // Now upload photo with newly generated ID
        if (item.photo_source_url) {
          const uploadedPath = await uploadLecturerPhoto(insertedRecord.id, item.photo_source_url);
          if (uploadedPath) {
            await supabase
              .from('lecturers')
              .update({ photo_storage_path: uploadedPath })
              .eq('id', insertedRecord.id);
            photosUploaded++;
          }
        }

        inserted++;
        console.log(`      + [BARU] ${item.name} (${item.nip || 'Tanpa NIP'})`);
      } else {
        // Existing record: upload photo if needed
        if (shouldUploadPhoto && item.photo_source_url) {
          const uploadedPath = await uploadLecturerPhoto(targetId, item.photo_source_url);
          if (uploadedPath) {
            recordData.photo_storage_path = uploadedPath;
            photosUploaded++;
          }
        } else {
          recordData.photo_storage_path = photoStoragePath;
        }

        // Check if anything actually changed
        const hasChanges =
          existing.name !== recordData.name ||
          existing.position !== recordData.position ||
          existing.photo_source_url !== recordData.photo_source_url ||
          existing.photo_storage_path !== recordData.photo_storage_path ||
          existing.google_scholar_url !== recordData.google_scholar_url ||
          existing.scopus_url !== recordData.scopus_url ||
          JSON.stringify(existing.research_interests) !== JSON.stringify(recordData.research_interests);

        if (hasChanges) {
          const { error: updateError } = await supabase
            .from('lecturers')
            .update(recordData)
            .eq('id', targetId);

          if (updateError) {
            throw new Error(`Gagal update: ${updateError.message}`);
          }
          updated++;
          console.log(`      * [UPDATE] ${item.name}`);
        } else {
          unchanged++;
        }
      }

      if (item.nip) processedNips.add(item.nip);
      processedNames.add(item.normalized_name);
    } catch (err) {
      console.error(`      ! [GAGAL] ${item.name}: ${err.message}`);
      failed.push({ name: item.name, error: err.message });
    }
  }

  // Check for records in DB that were not found in current crawl (report for review, do not delete)
  const missingFromOfficial = (existingLecturers || []).filter(
    lec => (!lec.nip || !processedNips.has(lec.nip)) && !processedNames.has(lec.normalized_name)
  );

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n================================================================');
  console.log('  HASIL SINKRONISASI DOSEN MB-ITS');
  console.log('================================================================');
  console.log(`- Sumber resmi         : ${OFFICIAL_URL}`);
  console.log(`- Total dosen terambil : ${extractedList.length}`);
  console.log(`- Data baru di-insert  : ${inserted}`);
  console.log(`- Data diperbarui      : ${updated}`);
  console.log(`- Data tanpa perubahan : ${unchanged}`);
  console.log(`- Foto profil terunggah: ${photosUploaded}`);
  console.log(`- Gagal diproses       : ${failed.length}`);
  console.log(`- Waktu eksekusi       : ${durationSec} detik`);

  if (missingFromOfficial.length > 0) {
    console.log(`\n[PERHATIAN] Terdapat ${missingFromOfficial.length} data dosen di database yang tidak ditemukan pada laman resmi saat ini:`);
    for (const m of missingFromOfficial) {
      console.log(`  - ${m.name} (${m.nip || 'NIP tidak ada'})`);
    }
    console.log('  (Data ini tetap dipertahankan sesuai kebijakan non-destruktif).');
  }

  console.log('================================================================\n');

  return {
    totalExtracted: extractedList.length,
    inserted,
    updated,
    unchanged,
    photosUploaded,
    failed,
    missingFromOfficial
  };
}

syncAll().catch(err => {
  console.error('Fatal error during sync:', err);
  process.exit(1);
});
