import { Resource, ResourceType, FileFormat } from '@/types';
import { CourseWithDetails } from '@/types/course';

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function mapCategoryToResourceType(category: string): ResourceType {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('catatan')) return 'Catatan Kuliah';
  if (cat.includes('slide')) return 'Slide Dosen';
  if (cat.includes('uts')) return 'Soal UTS';
  if (cat.includes('uas')) return 'Soal UAS';
  if (cat.includes('praktikum')) return 'Panduan Praktikum';
  if (cat.includes('tugas')) return 'Tugas Proyek';
  return 'Catatan Kuliah';
}

function getFileFormat(mimeType: string, filename: string): FileFormat {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf') || mimeType?.includes('pdf')) return 'PDF';
  if (lower.endsWith('.zip') || mimeType?.includes('zip') || mimeType?.includes('compressed')) return 'ZIP';
  if (lower.endsWith('.ipynb')) return 'IPYNB';
  if (lower.endsWith('.docx') || lower.endsWith('.doc') || mimeType?.includes('word')) return 'DOCX';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || mimeType?.includes('sheet')) return 'XLSX';
  return 'PDF';
}

export function mapCoursesToResources(courses: CourseWithDetails[]): Resource[] {
  const resources: Resource[] = [];

  for (const course of courses) {
    const rawYear = course.academic_year?.trim() || '';
    const academicYearStr = rawYear
      ? (rawYear.toLowerCase().startsWith('kurikulum') ? rawYear : `Kurikulum ${rawYear}`)
      : 'Kurikulum Terkini';

    // Find first published attachment (if any) to enable direct download from the course card
    const primaryAttachment = course.attachments?.find((a) => a.is_published);

    // Exactly one card per course in /materi-soal.
    // Uploaded weekly learning modules are accessed inside the course / week module page.
    resources.push({
      id: `course-${course.id}`,
      title: course.name,
      courseCode: course.code || 'MB',
      courseName: course.name,
      semester: course.semester || 1,
      type: 'Catatan Kuliah',
      academicYear: academicYearStr,
      fileFormat: primaryAttachment ? getFileFormat(primaryAttachment.mime_type, primaryAttachment.file_name) : 'PDF',
      fileSize: primaryAttachment ? formatBytes(primaryAttachment.file_size_bytes) : `${course.credits || 3} SKS`,
      uploadedAt: new Date(primaryAttachment?.created_at || course.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      downloadCount: primaryAttachment?.download_count || 0,
      author: course.study_program || 'Departemen MB ITS',
      description:
        course.description ||
        `Silabus resmi, materi pembelajaran mingguan, dan evaluasi ${course.name}.`,
      sampleUrl: '',
      tags: [course.name, course.code || '', `${course.credits || 3} SKS`, 'Silabus & Modul Mingguan'].filter(Boolean),
      courseId: course.id,
      attachmentId: primaryAttachment?.id,
      courseDetails: course,
    });
  }

  return resources;
}
