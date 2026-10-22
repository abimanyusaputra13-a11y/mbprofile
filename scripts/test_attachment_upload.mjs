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

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Admin client for upload, Anon client for student signed URL test
const adminClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
const studentClient = createClient(supabaseUrl, supabaseAnonKey);

async function testAttachment() {
  console.log('--- Testing Weekly Attachment Upload & Signed URL Download ---');

  const courseId = '31293283-efc6-4761-ae66-ae809f814a9b';
  const topicId = '94449ff8-31cf-4ba8-94b9-c60440ac5390';
  const fileName = 'Slide_Kuliah_Ekonomi_Mikro_M1_M2.pdf';
  const storagePath = `courses/${courseId}/weeks/${topicId}/slide_kuliah_m1_m2.pdf`;

  // Sample educational PDF dummy payload
  const samplePdfContent = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Title (Pengantar Ekonomi Mikro MB ITS) /Creator (Departemen Manajemen Bisnis ITS) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF',
    'utf-8'
  );

  console.log('1. Uploading file buffer to storage bucket "course-attachments"...');
  const { data: uploadData, error: uploadError } = await adminClient.storage
    .from('course-attachments')
    .upload(storagePath, samplePdfContent, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadError) {
    console.error('Storage upload failed:', uploadError);
    process.exit(1);
  }
  console.log('Upload to Supabase Storage succeeded:', uploadData.path);

  console.log('2. Recording attachment metadata in database...');
  const { data: attRecord, error: dbError } = await adminClient
    .from('course_attachments')
    .insert({
      course_id: courseId,
      weekly_topic_id: topicId,
      file_name: fileName,
      storage_path: storagePath,
      mime_type: 'application/pdf',
      file_size_bytes: samplePdfContent.length,
      file_category: 'Slide Dosen',
      is_published: true,
    })
    .select()
    .single();

  if (dbError) {
    console.error('Database record insertion failed:', dbError);
    process.exit(1);
  }
  console.log('Attachment recorded in DB with ID:', attRecord.id);

  console.log('3. Generating short-lived signed URL (60 mins)...');
  const { data: signedData, error: signedError } = await adminClient.storage
    .from('course-attachments')
    .createSignedUrl(storagePath, 3600);

  if (signedError || !signedData?.signedUrl) {
    console.error('Signed URL generation failed:', signedError);
    process.exit(1);
  }
  console.log('Signed URL generated successfully (starts with):', signedData.signedUrl.substring(0, 60) + '...');

  console.log('4. Performing HTTP test download of signed URL...');
  const res = await fetch(signedData.signedUrl);
  if (!res.ok) {
    console.error('HTTP download failed with status:', res.status, res.statusText);
    process.exit(1);
  }

  const downloadedBytes = await res.arrayBuffer();
  console.log(`HTTP Download succeeded! Status: ${res.status}. Received ${downloadedBytes.byteLength} bytes.`);

  console.log('5. Testing whether studentClient (anon) can create signed URL:');
  const studentRes = await studentClient.storage
    .from('course-attachments')
    .createSignedUrl(storagePath, 3600);
  console.log('Student signed URL status:', studentRes.error ? `Error: ${studentRes.error.message}` : 'Success!');

  console.log('ATTACHMENT VERIFICATION PASSED PERFECTLY!');
}

testAttachment();
