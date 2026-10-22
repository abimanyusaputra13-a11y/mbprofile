export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  tag: string;
}

export interface OrganizationMember {
  role: string;
  name: string;
  division: string;
  badge: string;
}

export interface AcademicLab {
  id: string;
  name: string;
  head: string;
  focus: string;
  description: string;
  technologies: string[];
}

export const aboutData = {
  departmentName: 'Departemen Manajemen Bisnis',
  facultyName: 'Fakultas Desain Kreatif dan Bisnis Digital (FDKBD / CREABIZ), Institut Teknologi Sepuluh Nopember (ITS)',
  establishmentYear: '2011',
  tagline: 'Pendidikan Bisnis & Manajemen Berbasis Teknologi, Inovasi, dan Kewirausahaan',
  overview: [
    'Departemen Manajemen Bisnis, Institut Teknologi Sepuluh Nopember (ITS) menyelenggarakan pendidikan bisnis dan manajemen yang memadukan prinsip manajemen, teknologi, inovasi, kewirausahaan, riset, serta kolaborasi industri.',
    'Departemen ini menaungi dua program sarjana unggulan: S1 Manajemen Bisnis (Business Management) yang mencakup empat bidang utama (manajemen keuangan, operasi, pemasaran, dan SDM) dengan akreditasi nasional Unggul dan internasional FIBAA (2025–2030); serta S1 Bisnis Digital (Digital Business) yang memadukan manajemen bisnis dengan inovasi teknologi digital terakreditasi Baik (2024–2029).'
  ],
  vision: {
    title: 'Visi Departemen',
    statement:
      'To become a world-class Department of Business Management that contributes to national self-reliance and serves as a reference in education, research, community service, and innovation development in technology-based business and management, particularly in supporting industry and producing high-quality future business leaders and researchers.',
    isProvisionalNotice:
      '(Ringkasan terjemahan resmi visi Departemen Manajemen Bisnis ITS berdasarkan publikasi resmi https://www.its.ac.id/mb/en/about-us/our-vision/)'
  },
  mission: [
    {
      number: '01',
      title: 'Pendidikan (Education)',
      description:
        'Provide high-quality, internationally oriented business and management education relevant to technological and industrial developments, supported by digital learning, practical experience, research, and entrepreneurship.'
    },
    {
      number: '02',
      title: 'Pengembangan Lulusan (Graduate Development)',
      description:
        'Produce graduates with integrity, professionalism, entrepreneurial and innovative mindsets, environmental awareness, and the ability to compete nationally and internationally.'
    },
    {
      number: '03',
      title: 'Penelitian & Pengabdian (Research & Community Service)',
      description:
        'Develop internationally recognized research and apply knowledge to real problems faced by industry, government, and society.'
    },
    {
      number: '04',
      title: 'Tata Kelola & Kemitraan (Governance & Partnerships)',
      description:
        'Maintain transparent, accountable, technology-supported governance while developing relationships with industry, universities, alumni, and domestic and international partners.'
    }
  ],
  fourPillars: [
    {
      letter: 'F',
      word: 'Finance',
      description: 'Financial management, perancangan valuasi investasi, dan ketahanan finansial berbasis analisis kuantitatif modern.'
    },
    {
      letter: 'O',
      word: 'Operations',
      description: 'Operations management, efisiensi rantai pasok industri, dan keunggulan operasional proses bisnis.'
    },
    {
      letter: 'M',
      word: 'Marketing',
      description: 'Marketing management, riset pasar, dan strategi pemasaran digital yang berorientasi nilai pelanggan.'
    },
    {
      letter: 'H',
      word: 'Human Resource',
      description: 'Human resource management, pengembangan talenta profesional, dan kepemimpinan adaptif berintegritas.'
    }
  ],
  timeline: [
    {
      year: '2011',
      title: 'Pendirian Program Studi',
      description: 'Business Management was established as a study program within the Department of Industrial Engineering, Faculty of Industrial Technology.',
      tag: 'Awal Berdiri'
    },
    {
      year: '2013',
      title: 'Kemandirian Departemen & Laboratorium',
      description: 'Business Management became an independent department. Its four management concentrations were operations, finance, marketing, and human resources. The BAS and ESME laboratories were established.',
      tag: 'Departemen Mandiri'
    },
    {
      year: '2014',
      title: 'Akreditasi BAN-PT',
      description: 'The Business Management program received a B accreditation rating from BAN-PT.',
      tag: 'Akreditasi'
    },
    {
      year: '2015',
      title: 'Kelulusan Angkatan Pertama',
      description: 'The department graduated its first cohort of 11 students, including nine cum laude graduates.',
      tag: 'Alumni Perdana'
    },
    {
      year: '2017',
      title: 'Perpindahan ke Fakultas MBT',
      description: 'The department moved to the Faculty of Business and Technology Management.',
      tag: 'Transformasi'
    },
    {
      year: '2020',
      title: 'Bergabung ke FDKBD (CREABIZ)',
      description: 'The department became part of the Faculty of Creative Design and Digital Business (FDKBD/CREABIZ) following faculty restructuring.',
      tag: 'CREABIZ'
    },
    {
      year: '2022/2023',
      title: 'Pembukaan Program Magister (S2)',
      description: 'The Master\'s program in Management Science commenced in the odd semester.',
      tag: 'S2 Sains Manajemen'
    },
    {
      year: '2024/2025',
      title: 'Pembukaan S1 Bisnis Digital',
      description: 'The undergraduate Digital Business program began in the odd semester.',
      tag: 'S1 Bisnis Digital'
    }
  ] as TimelineEvent[],
  organizationStructure: {
    period: '2025/2026',
    associationName: 'Struktur Kepemimpinan Departemen Manajemen Bisnis ITS',
    roles: [
      { role: 'Kepala Departemen', name: 'Berto Mulia Wibawa, S.Pi., M.M., Ph.D.', division: 'Pimpinan Departemen', badge: 'Leadership' },
      { role: 'Sekretaris Departemen', name: 'Ni Gusti Made Rai, S.Psi., M.Psi., Psikolog.', division: 'Pimpinan Departemen', badge: 'Leadership' },
      { role: 'Kepala S1 Manajemen Bisnis', name: 'Prahardika Prihananto, S.T., M.T.', division: 'Program Sarjana', badge: 'Kaprodi MB' },
      { role: 'Kepala S1 Bisnis Digital', name: 'Puti Sinansari, S.T., M.M., Ph.D.', division: 'Program Sarjana', badge: 'Kaprodi BD' },
      { role: 'Kepala Laboratorium ESME', name: 'Harisatul Agustin, S.AB., M.AB., MBA.', division: 'Laboratorium ESME', badge: 'Lab Head' },
      { role: 'Kepala Laboratorium BAS', name: 'Sri Yayu Ninglasari, S.E., M.SEI.', division: 'Laboratorium BAS', badge: 'Lab Head' }
    ] as OrganizationMember[]
  },
  laboratories: [
    {
      id: 'lab-esme',
      name: 'Entrepreneurship and Small Medium Enterprise Development (ESME) Laboratory',
      head: 'Harisatul Agustin, S.AB., M.AB., MBA.',
      focus: 'Entrepreneurship, Marketing Management, Human Resource Management, Performance Measurement, Data Envelopment Analysis (DEA)',
      description: 'Laboratorium yang berfokus pada pengembangan kewirausahaan, riset strategi pemasaran, manajemen sumber daya manusia, pengukuran kinerja, dan analisis DEA bagi usaha mikro, kecil, dan menengah.',
      technologies: ['Entrepreneurship', 'Marketing Management', 'Human Resource Management', 'Performance Measurement', 'Data Envelopment Analysis (DEA)']
    },
    {
      id: 'lab-bas',
      name: 'Business Analytics and Strategy (BAS) Laboratory',
      head: 'Sri Yayu Ninglasari, S.E., M.SEI.',
      focus: 'Business Analytics, Strategic Management, Financial Management, Operations Management, Data-Driven Decision-Making and Business Intelligence',
      description: 'Laboratorium yang memfasilitasi riset analitik bisnis, perumusan strategi korporasi, manajemen keuangan, operasi industri, serta inteligensi bisnis berbasis data.',
      technologies: ['Business Analytics', 'Strategic Management', 'Financial Management', 'Operations Management', 'Business Intelligence']
    }
  ] as AcademicLab[]
};
