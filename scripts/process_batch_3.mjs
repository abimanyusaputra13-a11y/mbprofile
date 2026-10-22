import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const rawData = `
#MK
KODE: DB234402
NAMA: Pemodelan Kuantitatif Untuk Bisnis
PRODI: S1 Manajemen Bisnis
SEMESTER: 4
SKS: 3
DESKRIPSI: Mengajarkan pengetahuan fundamental serta keterampilan pengambilan keputusan ilmiah berbasis data kuantitatif.
REFERENSI: Introduction to Operations Research (10th Edition) | Hillier, F. S. and Lieberman, G. J. | 2016 | McGraw-Hill
JUMLAH_TOPIK: 14
TOPIK:
1 | Introduction To Quantitative Modelling For Business
2 | Decision Analysis
3 | Linear Programming: Model Formulation & Graphical Solution
4 | Linear Programming: Computer Solution And Sensitivity Analysis
5 | Integer Programming
6 | Goal Programming
7 | Transportation, Transshipment And Assignment Problem
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9 | Network Flow Model
10 | Dynamic Programming
11 | Queueing Analysis And Simulation
12 | Game Theory
13-15 | Latihan Soal & Software
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234403
NAMA: Manajemen Proyek
PRODI: S1 Manajemen Bisnis
SEMESTER: 4
SKS: 3
DESKRIPSI: Mempelajari manajemen proyek baik untuk skala kecil maupun besar.
REFERENSI: Project Management: A Systems Approach to Planning, Scheduling, and Controlling (10th Edition) | Harold Kerzner | 2009 | John Wiley and Sons, Inc.
JUMLAH_TOPIK: 10
TOPIK:
1 | Project Management
2 | Project Organization Structure
3 | Project Planning
4 | Project Scheduling
5 | Contract Management
6 | Quality Management
7 | Review
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Pengerjaan Laporan Perencanaan Proyek
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234404
NAMA: Akuntansi Manajerial
PRODI: S1 Manajemen Bisnis
SEMESTER: 4
SKS: 3
DESKRIPSI: Berfokus pada proses, penyediaan, dan penggunaan informasi akuntansi untuk pengambilan keputusan manajerial.
REFERENSI: Managerial Accounting (15th Edition) | Ray H. Garrison, Eric W. Noreen, Peter C. Brewer | 2015 | McGraw-Hill Education
JUMLAH_TOPIK: 7
TOPIK:
1 | Basic Concepts Of Managerial Accounting
2-4 | Determination Of Product Costs, Services And Other Cost Objects
5-6 | Planning And Controlling
7 | Managerial Decision Making
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Studi Kasus
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234405
NAMA: Manajemen Strategis
PRODI: S1 Manajemen Bisnis
SEMESTER: 4
SKS: 3
DESKRIPSI: Rangkaian kegiatan pengambilan keputusan yang fundamental dan komprehensif.
REFERENSI: Strategic Management (10th Edition) | David, F.R. | 2005 | Prentice Hall, Pearson Education Inc.
JUMLAH_TOPIK: 10
TOPIK:
1 | Stakeholders
2 | Vision, Mission, Goals, And Organizational Values
3 | External And Internal Analysis
4 | Strategy Formulation
5 | Implementation Of The Strategy
6 | Blue Ocean Strategy
7 | Strategic Alliances And Architecture
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Studi Kasus Perusahaan
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234406
NAMA: Kecerdasan Buatan Untuk Bisnis
PRODI: S1 Manajemen Bisnis
SEMESTER: 4
SKS: 2
DESKRIPSI: Memberikan gambaran umum AI dan perannya dalam bisnis.
REFERENSI: Artificial Intelligence for Business (2nd Edition) | Doug Rose | 2020 | Pearson
JUMLAH_TOPIK: 9
TOPIK:
1 | Basics Of Artificial Intelligence
2 | Basics Of Big Data
3 | Basics Of Machine Learning
4 | Machine Learning Approaches And Algorithms
5-6 | AI Applications In Manufacturing, Finance, Retail, Telecommunications And Public Service
7 | Risks Of Using AI
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Analisis Kasus & Diskusi
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234407
NAMA: Bisnis Internasional
PRODI: S1 Manajemen Bisnis
SEMESTER: 4
SKS: 3
DESKRIPSI: Memberikan pengetahuan dan keahlian dasar mengenai bisnis internasional.
REFERENSI: International Business: Competing in the Global Marketplace (9th Edition) | Hill, C. W. L., & Hult, G. T. M. | 2017 | McGraw Hill-Irwin
JUMLAH_TOPIK: 10
TOPIK:
1 | Globalization
2 | Differences Between Countries In Terms Of Politics, Economy, Culture
3 | International Trade And Investment Theories And Policies
4 | Regional Cooperation (Especially Those Followed By Indonesia)
5 | International Monetary System
6 | Internationalization Strategy: Market Entry Mode
7 | International Operations: Global Production, Outsourcing, Logistics, Marketing, HRM
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Studi Kasus Perusahaan Multinasional
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234501
NAMA: Manajemen Investasi Dan Portofolio
PRODI: S1 Manajemen Bisnis
SEMESTER: 5
SKS: 3
DESKRIPSI: Memberikan pengetahuan dan mekanisme pengelolaan aset keuangan.
REFERENSI: Investments (8th Edition) | Zvi Bodie, Alex Kane, Alan J. Marcus | 2009 | McGraw-Hill
JUMLAH_TOPIK: 10
TOPIK:
1 | Financial Assets
2 | Financial Market Mechanisms
3 | Bonds
4 | Stocks
5 | Efficient Portfolio
6 | Derivatives
7 | Review
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Latihan Perhitungan & Portofolio
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234502
NAMA: Komunikasi Bisnis
PRODI: S1 Manajemen Bisnis
SEMESTER: 5
SKS: 3
DESKRIPSI: Memberikan penjelasan tentang cara berpikir kritis, berkomunikasi efektif, dan mengembangkan kemampuan berkomunikasi dalam konteks bisnis.
REFERENSI: Business and Administrative Communication (9th Edition) | Locker, Kitty O., Donna S. Keinzler | 2010 | McGraw-Hill
JUMLAH_TOPIK: 9
TOPIK:
1 | Effective Presentation Techniques
2 | Information Analysis
3 | Effective Communication Techniques
4 | Writing Communication
5 | Digital Communication
6-7 | Praktik Presentasi
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Tugas Praktik Komunikasi Bisnis
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234503
NAMA: Penilaian Bisnis Dan Teknologi
PRODI: S1 Manajemen Bisnis
SEMESTER: 5
SKS: 3
DESKRIPSI: Memberikan pemahaman tentang pentingnya perusahaan mempertahankan investornya dengan terus menciptakan nilai.
REFERENSI: -
JUMLAH_TOPIK: 11
TOPIK:
1 | Basic Concepts Of Business Valuation
2 | Basic Concepts Of Three Basic Approaches To Business Valuation
3 | Business Valuation Using Income Approach
4 | Business Valuation Using Asset Approach
5 | Business Valuation Using The Market Approach
6 | Business Valuation Under Certain Conditions (Financial Distress And Merger-Acquisition Process)
7 | Business Valuation In Start-Up Companies & Private Companies
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9 | Business Valuation Of The Company's Intangible Assets
10-15 | Studi Kasus Valuasi
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234504
NAMA: Manajemen Layanan
PRODI: S1 Manajemen Bisnis
SEMESTER: 5
SKS: 3
DESKRIPSI: Memberikan pemahaman tentang pentingnya perusahaan mempertahankan investornya.
REFERENSI: -
JUMLAH_TOPIK: 7
TOPIK:
1 | Service Operations
2 | Service Consumers
3 | Service Delivery Process
4-7 | Improving Service Operations
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Studi Kasus Layanan
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)
`;

function parseBatch(dataText) {
  const blocks = dataText.split(/#MK\s*\n/).filter((b) => b.trim().length > 0);
  const courses = [];

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const course = { topics: [] };
    let readingTopics = false;

    for (const line of lines) {
      if (line.startsWith('KODE:')) {
        course.code = line.replace('KODE:', '').trim();
      } else if (line.startsWith('NAMA:')) {
        course.name = line.replace('NAMA:', '').trim();
      } else if (line.startsWith('PRODI:')) {
        course.study_program = line.replace('PRODI:', '').trim();
      } else if (line.startsWith('SEMESTER:')) {
        const val = line.replace('SEMESTER:', '').trim();
        course.semester = val === '-' ? null : parseInt(val, 10);
      } else if (line.startsWith('SKS:')) {
        const val = line.replace('SKS:', '').trim();
        course.credits = val === '-' ? null : parseInt(val, 10);
      } else if (line.startsWith('DESKRIPSI:')) {
        const val = line.replace('DESKRIPSI:', '').trim();
        course.description = val === '-' ? null : val;
      } else if (line.startsWith('REFERENSI:')) {
        const val = line.replace('REFERENSI:', '').trim();
        if (val === '-') {
          course.reference = null;
        } else {
          const parts = val.split('|').map((p) => p.trim());
          course.reference = {
            title: parts[0] || '',
            author: parts[1] || '',
            publication_year: !parts[2] || parts[2] === '-' ? null : parts[2],
            publisher: !parts[3] || parts[3] === '-' ? null : parts[3],
          };
        }
      } else if (line.startsWith('JUMLAH_TOPIK:')) {
        course.expected_topics_count = parseInt(line.replace('JUMLAH_TOPIK:', '').trim(), 10);
      } else if (line.startsWith('TOPIK:')) {
        readingTopics = true;
      } else if (readingTopics) {
        const parts = line.split('|').map((p) => p.trim());
        if (parts.length >= 2) {
          course.topics.push({
            week_number: parts[0],
            topic_title: parts[1],
            subtopics: parts[2] || null,
          });
        }
      }
    }
    courses.push(course);
  }
  return courses;
}

// Read env for supabase client
const env = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach((l) => {
  const m = l.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const parsedCourses = parseBatch(rawData);
  console.log(`Parsed ${parsedCourses.length} course blocks from BATCH 3.`);

  // Validation
  for (const c of parsedCourses) {
    console.log(`Validation for [${c.code}] ${c.name}:`);
    console.log(`  Parsed topics count: ${c.topics.length}, Expected: ${c.expected_topics_count}`);
    if (c.topics.length !== c.expected_topics_count) {
      throw new Error(`Topic count mismatch for ${c.code}: got ${c.topics.length}, expected ${c.expected_topics_count}`);
    }
    if (c.reference) {
      console.log(`  Reference: ${c.reference.title} | ${c.reference.author} | Year: ${c.reference.publication_year ?? '-'} | Publisher: ${c.reference.publisher ?? '-'}`);
    } else {
      console.log(`  Reference: (None)`);
    }
  }

  console.log('\n--- Processing Courses into Supabase Database ---\n');

  for (let i = 0; i < parsedCourses.length; i++) {
    const c = parsedCourses[i];
    console.log(`\n[${i + 1}/${parsedCourses.length}] Processing Course: [${c.code}] ${c.name}`);

    // Check if course already exists by code
    const { data: existingCourses, error: searchErr } = await supabase
      .from('courses')
      .select('*')
      .eq('code', c.code);

    if (searchErr) throw searchErr;

    let courseId;
    if (existingCourses && existingCourses.length > 0) {
      const existing = existingCourses[0];
      courseId = existing.id;
      console.log(`  Existing course found with ID: ${courseId}`);

      const { error: updateErr } = await supabase
        .from('courses')
        .update({
          name: c.name,
          study_program: c.study_program,
          semester: c.semester,
          credits: c.credits,
          description: c.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', courseId);

      if (updateErr) throw updateErr;
      console.log(`  Updated basic course info.`);
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('courses')
        .insert({
          code: c.code,
          name: c.name,
          study_program: c.study_program,
          semester: c.semester,
          credits: c.credits,
          description: c.description,
          academic_year: '2025/2026',
          is_published: false,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      courseId = inserted.id;
      console.log(`  Inserted new course with ID: ${courseId}`);
    }

    // Process Weekly Topics
    const { data: existingTopics, error: topErr } = await supabase
      .from('course_weekly_topics')
      .select('*')
      .eq('course_id', courseId)
      .order('display_order');

    if (topErr) throw topErr;

    const topicsToKeepIds = new Set();
    if (existingTopics && existingTopics.length > 0) {
      for (let tIdx = 0; tIdx < c.topics.length; tIdx++) {
        const topicData = c.topics[tIdx];
        const displayOrder = tIdx + 1;
        if (tIdx < existingTopics.length) {
          const exTopic = existingTopics[tIdx];
          topicsToKeepIds.add(exTopic.id);
          const { error: updTopErr } = await supabase
            .from('course_weekly_topics')
            .update({
              week_number: topicData.week_number,
              topic_title: topicData.topic_title,
              subtopics: topicData.subtopics,
              display_order: displayOrder,
            })
            .eq('id', exTopic.id);
          if (updTopErr) throw updTopErr;
        } else {
          const { data: newTop, error: insTopErr } = await supabase
            .from('course_weekly_topics')
            .insert({
              course_id: courseId,
              week_number: topicData.week_number,
              topic_title: topicData.topic_title,
              subtopics: topicData.subtopics,
              display_order: displayOrder,
            })
            .select()
            .single();
          if (insTopErr) throw insTopErr;
          topicsToKeepIds.add(newTop.id);
        }
      }

      for (let tIdx = c.topics.length; tIdx < existingTopics.length; tIdx++) {
        const surplus = existingTopics[tIdx];
        await supabase.from('course_weekly_topics').delete().eq('id', surplus.id);
      }
    } else {
      const topicsToInsert = c.topics.map((t, idx) => ({
        course_id: courseId,
        week_number: t.week_number,
        topic_title: t.topic_title,
        subtopics: t.subtopics,
        display_order: idx + 1,
      }));
      const { error: batchInsErr } = await supabase
        .from('course_weekly_topics')
        .insert(topicsToInsert);
      if (batchInsErr) throw batchInsErr;
    }
    console.log(`  Processed ${c.topics.length} weekly topics.`);

    // Process Reference
    if (c.reference) {
      const { data: existingRefs } = await supabase
        .from('course_references')
        .select('*')
        .eq('course_id', courseId);

      if (existingRefs && existingRefs.length > 0) {
        const refId = existingRefs[0].id;
        const { error: updRefErr } = await supabase
          .from('course_references')
          .update({
            title: c.reference.title,
            author: c.reference.author,
            publication_year: c.reference.publication_year,
            publisher: c.reference.publisher,
            is_primary: true,
          })
          .eq('id', refId);
        if (updRefErr) throw updRefErr;
        console.log(`  Updated existing reference: "${c.reference.title}"`);
      } else {
        const { error: insRefErr } = await supabase
          .from('course_references')
          .insert({
            course_id: courseId,
            title: c.reference.title,
            author: c.reference.author,
            publication_year: c.reference.publication_year,
            publisher: c.reference.publisher,
            is_primary: true,
          });
        if (insRefErr) throw insRefErr;
        console.log(`  Inserted reference: "${c.reference.title}"`);
      }
    }

    // Verification (Langkah E)
    const { count: finalTopicCount } = await supabase
      .from('course_weekly_topics')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    const { count: finalRefCount } = await supabase
      .from('course_references')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    console.log(`  [Langkah E Verification]: Topics in DB = ${finalTopicCount} (Target: ${c.expected_topics_count}) -> ${finalTopicCount === c.expected_topics_count ? 'MATCH OK' : 'FAILED'}`);
    console.log(`  References in DB = ${finalRefCount}`);
  }

  console.log('\n=== ALL 10 COURSES IN BATCH 3 SUCCESSFULLY PROCESSED! ===');
}

run().catch((err) => {
  console.error('Fatal error during batch 3 processing:', err);
  process.exit(1);
});
