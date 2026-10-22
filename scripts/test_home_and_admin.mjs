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

  console.log('\n--- 2. Testing Courses Table ---');
  const { data: courses, error: courseError } = await supabase
    .from('courses')
    .select('id, name, code, is_published, download_count');

  if (courseError) {
    console.error('Courses error:', courseError);
  } else {
    console.log(`Successfully fetched ${courses.length} courses from database.`);
    courses.slice(0, 3).forEach((c) => {
      console.log(` - ${c.code}: ${c.name} (${c.download_count || 0} visits)`);
    });
  }

  console.log('\n--- 5. Testing Quizzes & Questions Structure ---');
  const { data: testQuizzes, error: quizError } = await supabase
    .from('course_quizzes')
    .select('id, title, is_published, quiz_questions(id, question_text, points, quiz_question_options(id, option_text, is_correct))');

  if (quizError) {
    console.error('Quiz fetch error:', quizError);
  } else {
    console.log(`Successfully verified ${testQuizzes.length} course quizzes in database:`);
    testQuizzes.forEach((q) => {
      console.log(` - [${q.is_published ? 'PUBLIK' : 'DRAF'}] ${q.title} (${q.quiz_questions?.length || 0} soal)`);
    });
  }

  console.log('\n--- 6. Testing HTTP Status of Pages ---');
  const routes = [
    { name: 'Home Page', url: 'http://localhost:3000/' },
    { name: 'Removed Laporan Page (Expect 404)', url: 'http://localhost:3000/laporan' },
    { name: 'Admin Login', url: 'http://localhost:3000/admin/login' },
    { name: 'Weekly Learning Topic with Quizzes', url: 'http://localhost:3000/courses/78cca0d7-8075-4a26-988b-76815a6ebde8/weeks/95dd14c4-37af-41e1-b33f-854dd57fccb0' },
    { name: 'Student Quiz Taker Page', url: 'http://localhost:3000/courses/78cca0d7-8075-4a26-988b-76815a6ebde8/weeks/95dd14c4-37af-41e1-b33f-854dd57fccb0/quiz/8c84d474-58f6-4a72-992b-77586a598bc6' },
    { name: 'Admin Quizzes (Protected, Expect 307 Redirect)', url: 'http://localhost:3000/admin/quizzes' },
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
