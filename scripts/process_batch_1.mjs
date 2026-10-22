import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const rawData = `
#MK
KODE: DB234101
NAMA: Pengantar Manajemen Bisnis
PRODI: S1 Manajemen Bisnis
SEMESTER: 1
SKS: 3
DESKRIPSI: Memberikan pengetahuan dan teori tentang mengelola bisnis, mencakup sifat bisnis, mengelola orang, prinsip pemasaran, pengambilan keputusan, sistem keuangan, dan penerapan teori melalui tugas.
REFERENSI: Management (11th Global Edition) | Robbins, S. & Coulter, M. | 2009 | Pearson
JUMLAH_TOPIK: 16
TOPIK:
1 | Introduction: Organizations, Managers, And Business
2 | Academic Research, Writing, And Referencing Ability
3 | Management Theory And Its Evolution
4 | Business Constraints And Manager Constraints
5 | Planning
6 | Organizing
7 | Managing Resources
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9 | Lead
10 | Motivate
11 | Controlling
12 | Operational Management
13 | Marketing Management And Product Management
14 | Distributing And Promoting Products
15 | Managing Business Finances
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234102
NAMA: Pengantar Akuntansi
PRODI: S1 Manajemen Bisnis
SEMESTER: 1
SKS: 3
DESKRIPSI: Memberikan pemahaman tentang konsep dan prinsip akuntansi keuangan (definisi, pengakuan, pengukuran, penyajian, pengungkapan) serta aplikasinya untuk analisis laporan keuangan.
REFERENSI: Accounting Principles IFRS Version, Global Edition | Weygandt, Jerry J., Kimmel, Paul D., Kieso, Donald E. | 2018 | John Wiley & Sons
JUMLAH_TOPIK: 16
TOPIK:
1 | Definition And Function Of Accounting
2 | Accounting Equation
3 | Process Of Accounting Records - Journalizing
4 | Accounting Recording Process - Ledger Posting
5 | Adjusting Journal Process
6 | Preparation Of Service Company Financial Reports
7 | Cash And Receivables
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9 | Supply (Inventory)
10 | Investment
11 | Fixed Assets & Intangible Assets
12 | Short Term & Long Term Liabilities
13 | Equity: Paid-In Capital & Retained Earnings, Dividends, Treasury Shares, Other Comprehensive Income
14 | Income (Revenue)
15 | Financial Report Analysis
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234103
NAMA: Pemodelan Data
PRODI: S1 Manajemen Bisnis
SEMESTER: 1
SKS: 3
DESKRIPSI: Pengantar analisis data untuk mempersiapkan mahasiswa memasuki dunia kerja dengan keterampilan menggunakan Microsoft Excel dan Power BI.
REFERENSI: Microsoft Excel Data Analysis and Business Modelling (7th Edition) | Winston, Wayne L. | 2022 | Microsoft Corporation and Pearson
JUMLAH_TOPIK: 10
TOPIK:
1 | Introduction To Data Analysis
2 | Basic Formulas And Excel Functions
3 | Data Formatting
4 | Describe And Visualize Data
5 | Basic Pivot Data
6 | Using Power Query
7 | Using Microsoft Power BI
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Pendalaman Materi & Studi Kasus
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234104
NAMA: Ekonomi Mikro
PRODI: S1 Manajemen Bisnis
SEMESTER: 1
SKS: 3
DESKRIPSI: Memahami ilmu ekonomi skala mikro termasuk karakteristik pelaku ekonomi (konsumen dan produsen) dan interaksinya.
REFERENSI: Principles of Microeconomics (9th Edition) | N. Gregory Mankiw | 2021 | Cengage Learning
JUMLAH_TOPIK: 14
TOPIK:
1 | Economic And Microeconomic Concepts
2 | Law Of Supply And Demand
3 | Elasticity Theory
4 | Market And Consumer Behavior
5 | Production And Production Costs
6 | Perfect Competition Market
7 | Monopoly Market
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9 | Monopolistic Market
10 | Oligopoly Market
11 | Market Of Production Factors
12 | Market Failure And Externalities
13-15 | Studi Kasus & Pendalaman
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: SM234152
NAMA: Matematika 1
PRODI: Mata Kuliah Bersama
SEMESTER: 1
SKS: 2
DESKRIPSI: Mengajarkan pengetahuan fundamental serta keterampilan pengambilan keputusan ilmiah berbasis data kuantitatif dan fakta.
REFERENSI: Calculus Textbook 1 (4th Edition) | Tim Dosen Matematika ITS | 2018 | -
JUMLAH_TOPIK: 13
TOPIK:
1 | The Basic Concepts Of Matrix Algebra
2 | Characteristics Of Determinants
3 | Elementary Row Operations
4 | Systems Of Linear Equations
5 | The Problem Of Eigenvalues Or Eigenvectors
6 | Basic Concept Of Real Number System
7 | Basic Concepts Of Complex Numbers
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9 | Derivative
10 | The Implementation Of Derivative
11 | Indefinite Integral
12-15 | Latihan Soal & Pendalaman
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234105
NAMA: Design Thinking For Innovation
PRODI: S1 Manajemen Bisnis
SEMESTER: 2
SKS: 3
DESKRIPSI: Memperkenalkan konsep pendekatan kreatif untuk memecahkan masalah dengan fokus pada manusia sebagai pengguna.
REFERENSI: The Field Guide to Human-Centered Design | IDEO | 2015 | -
JUMLAH_TOPIK: 12
TOPIK:
1 | Brief Introduction Of Design Thinking Course
2 | Design Research Vs Scientific Research
3 | Double Diamond
4 | Empathy Map
5 | Personas
6 | Point Of View
7 | How Might We Questions
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9 | Prototyping
10 | User Testing
11-15 | Pengerjaan Proyek & Persiapan Exhibition
16 | Exhibition / Evaluasi Bersama Akhir Semester

#MK
KODE: DB234201
NAMA: Makroekonomi
PRODI: S1 Manajemen Bisnis
SEMESTER: 2
SKS: 3
DESKRIPSI: Membahas prinsip-prinsip ekonomi makro.
REFERENSI: Principles of Macroeconomics (13th Edition) | Case, Karl E., Fair, Ray. C., Oster, Sharon E. | 2019 | Pearson
JUMLAH_TOPIK: 16
TOPIK:
1 | Introduction To Macroeconomics
2 | National Income
3 | Unemployment And Inflation
4 | Aggregate Spending
5 | Fiscal Policy
6 | Money, The Federal Reserve, And Interest Rates
7 | Determination Of Aggregate Output, Price Level, And Interest Rate
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9 | Aggregate Supply And Aggregate Demand
10 | Labor Market
11 | Financial Crisis, Stabilization, And Deficits
12 | Household And Firm Behavior In Macroeconomics
13 | Long-Term Economic Growth
14 | International Trade, Comparative Advantage, And Protectionism
15 | Open Economy: Balance Of Payments And Exchange Rates & Economic Growth In Developing Countries
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234202
NAMA: Manajemen Pemasaran
PRODI: S1 Manajemen Bisnis
SEMESTER: 2
SKS: 3
DESKRIPSI: Memberikan pemahaman dasar tentang pemasaran, mencocokkan produk, saluran, distribusi, harga, dan komunikasi dengan pelanggan.
REFERENSI: Marketing Management (15th Edition) | Kotler, P., & Keller, K. L. | 2016 | Pearson Education, Inc.
JUMLAH_TOPIK: 10
TOPIK:
1 | Introduction To Marketing Management
2 | Trends And Consumers
3 | Market
4 | Brand
5 | Marketing Channel
6 | Products And Values
7 | Marketing Communications
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Analisis Kasus & Proyek Pemasaran
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234203
NAMA: Manajemen Operasi
PRODI: S1 Manajemen Bisnis
SEMESTER: 2
SKS: 3
DESKRIPSI: Mencakup aktivitas utama dalam fungsi operasional bisnis manufaktur dan jasa.
REFERENSI: Operations Management: Sustainability and Supply Chain Management (12th Edition) | Heizer, J., Render, B., Munson, C | 2017 | Pearson
JUMLAH_TOPIK: 16
TOPIK:
1 | Introduction To Operations, Productivity And Strategy
2 | Operational Strategy In A Global Scope
3 | Forecasting
4 | Design Of Goods And Services
5 | Quality Management
6 | Control Process Statistics
7 | Process Strategy And Capacity Planning
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9 | Supply Chain Management
10 | Resources, Job Design, And Performance Measurement
11 | Inventory Management
12 | Aggregate Planning And Sales Operations Planning
13 | MRP And ERP
14 | Lean Operations
15 | Review Materi
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234204
NAMA: Manajemen Keuangan
PRODI: S1 Manajemen Bisnis
SEMESTER: 2
SKS: 3
DESKRIPSI: Mempelajari pengelolaan keuangan perusahaan dengan tujuan memaksimalkan nilai perusahaan.
REFERENSI: Fundamentals of Financial Management (13th Edition) | Van Horne, James C., and Wachowicz Jr., John M. | 2009 | Pearson Education Limited
JUMLAH_TOPIK: 10
TOPIK:
1 | Risk And Return
2 | Financial Statement Analysis
3 | Working Capital
4 | Capital Budgeting
5 | Cost Of Capital
6 | Capital Structure
7 | Deviden Policy
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Studi Kasus & Latihan Soal
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

async function run() {
  const parsedCourses = parseBatch(rawData);
  console.log(`Parsed ${parsedCourses.length} course blocks from BATCH 1.`);

  // Validation
  for (const c of parsedCourses) {
    console.log(`Validation for [${c.code}] ${c.name}:`);
    console.log(`  Parsed topics count: ${c.topics.length}, Expected: ${c.expected_topics_count}`);
    if (c.topics.length !== c.expected_topics_count) {
      throw new Error(`Topic count mismatch for ${c.code}: got ${c.topics.length}, expected ${c.expected_topics_count}`);
    }
    if (c.reference) {
      console.log(`  Reference: ${c.reference.title} | ${c.reference.author} | Year: ${c.reference.publication_year ?? '-'} | Publisher: ${c.reference.publisher ?? '-'}`);
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

      // Update basic info
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
      // Insert new course
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
    // Fetch existing topics for this course
    const { data: existingTopics, error: topErr } = await supabase
      .from('course_weekly_topics')
      .select('*')
      .eq('course_id', courseId)
      .order('display_order');

    if (topErr) throw topErr;

    // Check foreign key dependencies on existing topics
    const topicsToKeepIds = new Set();
    if (existingTopics && existingTopics.length > 0) {
      // For each parsed topic at index idx:
      // If an existing topic exists at that index and has attachments or materials, update it in place!
      // Otherwise, we can update or delete.
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
          // Insert new topic
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

      // If existingTopics was longer than c.topics, remove surplus topics that have no attachments
      for (let tIdx = c.topics.length; tIdx < existingTopics.length; tIdx++) {
        const surplus = existingTopics[tIdx];
        await supabase.from('course_weekly_topics').delete().eq('id', surplus.id);
      }
    } else {
      // Insert all topics fresh
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
      // Remove any existing reference with same title or update/insert
      const { data: existingRefs } = await supabase
        .from('course_references')
        .select('*')
        .eq('course_id', courseId);

      if (existingRefs && existingRefs.length > 0) {
        // Update first reference
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

  console.log('\n=== ALL 10 COURSES IN BATCH 1 SUCCESSFULLY PROCESSED! ===');
}

run().catch((err) => {
  console.error('Fatal error during batch processing:', err);
  process.exit(1);
});
