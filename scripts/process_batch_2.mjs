import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const rawData = `
#MK
KODE: DB234205
NAMA: Manajemen Sumber Daya Manusia
PRODI: S1 Manajemen Bisnis
SEMESTER: 2
SKS: 3
DESKRIPSI: Mengenalkan prinsip dan teknik dasar manajemen sumber daya manusia serta aspek teknis implementasinya di dunia bisnis nyata.
REFERENSI: Human Resource Management (13th Edition) | Dessler, G. | 2013 | Pearson
JUMLAH_TOPIK: 10
TOPIK:
1 | Human Resource Management Concept
2 | Job Design And Analysis
3 | Recruitment And Selection
4 | Training And Development Design
5 | Performance Appraisal, Compensation And Employee Benefits
6 | Labor Management And Occupational Health And Safety
7 | Review & Studi Kasus
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Proyek Penerapan MSDM di Organisasi
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234206
NAMA: Penciptaan Usaha Baru
PRODI: S1 Manajemen Bisnis
SEMESTER: 2
SKS: 4
DESKRIPSI: Berfokus pada penciptaan usaha baru oleh mahasiswa, menggabungkan teori buku teks dan pengalaman kewirausahaan.
REFERENSI: Business Model Generation: A Handbook for Visionaries, Game Changers, and Challengers | Osterwalder, A., Pigneur, Y., In Clark, T., & Smith, A. | 2010 | -
JUMLAH_TOPIK: 8
TOPIK:
1 | Creating Business Mindset
2 | Business Model And Value Proposition Design
3 | Dealing With Suppliers, Consumers, And Investors
4-7 | Business Practice (Persiapan)
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-14 | Business Practice (Eksekusi)
15 | Start-Up Exhibition & Poster
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234301
NAMA: Sistem Informasi Bisnis
PRODI: S1 Manajemen Bisnis
SEMESTER: 3
SKS: 3
DESKRIPSI: Memberikan pemahaman pengetahuan untuk mengelola dan menganalisis dampak sistem informasi terhadap keunggulan kompetitif.
REFERENSI: Information Systems for Business: An Experiential Approach | Belanger, F., & Van Slyke, C. | 2011 | John Wiley & Sons
JUMLAH_TOPIK: 14
TOPIK:
1 | The Value Of Information And Introduction To Information System
2 | Evaluating Information
3 | Gaining Strategic Value From Information
4 | Storing And Organizing Information
5 | Analyzing Information For Business Decision-Making
6 | Transmitting Information
7 | Securing Information
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9 | Protecting The Confidentiality And Privacy Information
10 | Information-Based Business Process
11 | Enterprise Information System
12 | Information For Electronic Business
13-15 | Studi Kasus & Proyek
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234302
NAMA: Desain Dan Perilaku Organisasi
PRODI: S1 Manajemen Bisnis
SEMESTER: 3
SKS: 3
DESKRIPSI: Dirancang untuk mahasiswa yang ingin mengelola bisnis, memberikan deskripsi perilaku organisasi dan perbaikan desain.
REFERENSI: Organizational Behavior (17th Edition) | Stephen P. Robbins & Timothy A. Judge | 2016 | Pearson
JUMLAH_TOPIK: 13
TOPIK:
1 | Basic Concepts Of Organizational Behavior
2 | Concept Of Emotion, Mood, Motivation
3 | Diversity In Organizations
4 | Attitudes And Job Satisfaction
5 | Perception And Decision Making
6 | Negotiation Communication, And Leadership
7 | Group Behavior And Work Teams
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9 | Organizational Culture And Organizational Policies
10 | Changes In The Organization
11 | Stress Management In The Work Environment
12-15 | Analisis Kasus
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234303
NAMA: Aspek Hukum Dalam Bisnis
PRODI: S1 Manajemen Bisnis
SEMESTER: 3
SKS: 3
DESKRIPSI: Memberikan pemahaman komprehensif tentang prinsip dasar hukum perdata dan hukum dagang yang diperlukan dalam kegiatan bisnis.
REFERENSI: Hukum Bisnis Untuk Perusahaan (Teori & Contoh Kasus) | Saliman, Abdul Rasyid; Wirazilmustaan | 2020 | Prenada Media
JUMLAH_TOPIK: 10
TOPIK:
1 | Basic Concepts And Scope Of Civil Law In Indonesia
2 | Form Of Business Organization
3 | Business Agreement
4 | Intellectual Property Rights
5 | Bankruptcy
6 | Taxation
7 | Review Materi
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Studi Kasus Hukum Bisnis
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234304
NAMA: Perilaku Konsumen
PRODI: S1 Manajemen Bisnis
SEMESTER: 3
SKS: 3
DESKRIPSI: Mengkaji ilmu sosial dan riset perilaku konsumen untuk konsep dan prinsip yang dapat digunakan pemasar.
REFERENSI: Consumer Behavior: Buying, Having, and Being (12th Edition) | Solomon, M. R. | 2017 | Pearson Prentice Hall
JUMLAH_TOPIK: 8
TOPIK:
1 | Consumers, Marketers, And Technology
2-3 | Consumers As Individuals
4-5 | Communication And Consumer Behavior
6-7 | Social And Cultural Settings
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-14 | Consumer Decision Making, Marketing Ethics, And Consumer Research
15 | Review Proyek
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234305
NAMA: Statistik Untuk Bisnis
PRODI: S1 Manajemen Bisnis
SEMESTER: 3
SKS: 3
DESKRIPSI: Mengajarkan konsep statistik bisnis serta pentingnya keterampilan statistik dalam bisnis.
REFERENSI: Business Statistics: A Decision Making Approach (8th Edition) | Groebner, D.F., Shannon, P.W., Fry, P.C., Smith, K.D. | 2011 | Prentice Hall
JUMLAH_TOPIK: 10
TOPIK:
1 | Data Distribution
2 | Probability
3 | Sampling
4 | Estimation
5 | ANOVA
6 | Regression
7 | Hypotheses Testing
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Latihan Soal & Studi Kasus SPSS/Excel
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234306
NAMA: Kewirausahaan Sosial
PRODI: S1 Manajemen Bisnis
SEMESTER: 3
SKS: 4
DESKRIPSI: Berfokus pada penciptaan usaha sosial oleh mahasiswa, menggabungkan teori dan praktik terbaik.
REFERENSI: Social Entrepreneurship: A Modern Approach to Social Value Creation | Arthur C. Brooks | 2009 | Prentice Hall
JUMLAH_TOPIK: 8
TOPIK:
1 | Sociopreneurship Best Practice
2 | Social Business Model
3 | Social Enterprise Business Plan
4-7 | Fieldwork (Persiapan)
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-14 | Fieldwork (Eksekusi)
15 | Social Entrepreneurship Exhibition
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234307
NAMA: Etika Bisnis Dan Tanggung Jawab Sosial Perusahaan
PRODI: S1 Manajemen Bisnis
SEMESTER: 3
SKS: 2
DESKRIPSI: Dirancang dengan multidisiplin berdasarkan perilaku organisasi, psikologi, etika, dan filsafat.
REFERENSI: Business Ethics: Decision Making and Cases (10th Edition) | Ferrell, O.C, Fraedrich, J and Ferrell, L | 2015 | South Western Cengage Learning
JUMLAH_TOPIK: 7
TOPIK:
1 | Theory On Business Ethics And CSR
2 | Process Of Ethical Decision And Dilemma
3 | Ethical Decision Making In Functional Management
4-7 | Studi Kasus
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Presentasi & Diskusi Kasus
16 | Evaluasi Bersama Akhir Semester (Ujian Akhir Semester)

#MK
KODE: DB234401
NAMA: Metode Penelitian Bisnis
PRODI: S1 Manajemen Bisnis
SEMESTER: 4
SKS: 3
DESKRIPSI: Memberikan pemahaman tentang konsep dan publikasi penelitian untuk pengembangan ilmiah.
REFERENSI: Business Research Methods | Quinlan, C., Babin, B., Carr, J., Griffin, M., & Zikmund, W. G. | 2015 | Cengage Learning EMEA
JUMLAH_TOPIK: 10
TOPIK:
1 | The Nature Of Business Research
2 | Research Background
3 | Problem Formulation
4 | Research Strategy/Design
5 | Methods Of Data Collection
6 | Methods Of Data Analysis
7 | Presenting, Evaluating, And Interpreting Findings
8 | Evaluasi Bersama Tengah Semester (Ujian Tengah Semester)
9-15 | Bimbingan Proposal Penelitian
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
  console.log(`Parsed ${parsedCourses.length} course blocks from BATCH 2.`);

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

  console.log('\n=== ALL 10 COURSES IN BATCH 2 SUCCESSFULLY PROCESSED! ===');
}

run().catch((err) => {
  console.error('Fatal error during batch 2 processing:', err);
  process.exit(1);
});
