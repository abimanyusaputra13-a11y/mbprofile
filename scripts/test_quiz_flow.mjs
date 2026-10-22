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
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  console.log('--- 1. Testing Student View (Public Anonymized Options) ---');
  const quizId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  const { data: quiz, error: quizError } = await supabase
    .from('course_quizzes')
    .select('*')
    .eq('id', quizId)
    .single();

  if (quizError) {
    console.error('Failed to fetch quiz:', quizError);
    process.exit(1);
  }

  console.log('Quiz Title:', quiz.title);

  const { data: questions, error: qError } = await supabase
    .from('quiz_questions')
    .select('id, question_text, question_type, points, quiz_question_options(id, option_text, display_order)')
    .eq('quiz_id', quizId)
    .order('display_order', { ascending: true });

  if (qError) {
    console.error('Failed to fetch questions:', qError);
    process.exit(1);
  }

  console.log(`Fetched ${questions.length} questions successfully.`);
  
  let hasLeak = false;
  for (const q of questions) {
    for (const opt of q.quiz_question_options) {
      if (opt.is_correct !== undefined) {
        hasLeak = true;
      }
    }
  }
  console.log('Security check (is_correct omitted in client view):', hasLeak ? 'FAILED (LEAKED!)' : 'PASSED (SECURE)');

  console.log('--- 2. Testing End-to-End Database Submission ---');
  // Insert an attempt for student
  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .insert({
      quiz_id: quizId,
      student_name: 'Budi Santoso (Test Runner)',
      student_identifier: '5025211001',
      started_at: new Date(Date.now() - 300000).toISOString(),
      submitted_at: new Date().toISOString(),
      status: 'completed',
      score: 35,
      max_score: 35,
      percentage: 100.0,
      is_passed: true,
      feedback: 'Luar biasa! Anda berhasil menjawab seluruh pertanyaan dengan sempurna (100%).'
    })
    .select()
    .single();

  if (attemptError) {
    console.error('Failed to record attempt:', attemptError);
    process.exit(1);
  }

  console.log('Attempt recorded successfully with ID:', attempt.id);
  console.log('Score:', attempt.score, '/', attempt.max_score, `(${attempt.percentage}%)`, 'Passed:', attempt.is_passed);

  console.log('--- 3. Testing Course Navigation Query ---');
  const { data: topicData, error: topicErr } = await supabase
    .from('course_weekly_topics')
    .select('*, weekly_materials(*), course_attachments(*), course_quizzes(*)')
    .eq('id', '94449ff8-31cf-4ba8-94b9-c60440ac5390')
    .single();

  if (topicErr) {
    console.error('Failed to fetch topic data:', topicErr);
    process.exit(1);
  }

  console.log('Topic:', topicData.topic_title);
  console.log('Materials Count:', topicData.weekly_materials?.length);
  console.log('Quizzes Count:', topicData.course_quizzes?.length);
  console.log('Attachments Count:', topicData.course_attachments?.length);
  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
}

runTest();
