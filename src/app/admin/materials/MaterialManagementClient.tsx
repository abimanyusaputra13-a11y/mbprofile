'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  AdminMaterialItem,
  MaterialInput,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  reviewMaterial,
  getMaterialDownloadUrl,
} from '@/lib/actions/materials';
import { Badge } from '@/components/ui/Badge';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { SearchInput } from '@/components/ui/SearchInput';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  BookOpen,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
  RotateCcw,
  User,
  Layers,
  GraduationCap,
} from 'lucide-react';

interface Props {
  initialMaterials: AdminMaterialItem[];
  error?: string;
}

export function MaterialManagementClient({ initialMaterials, error }: Props) {
  const router = useRouter();
  const [materials, setMaterials] = useState<AdminMaterialItem[]>(initialMaterials);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Semua Tipe');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMaterialItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<AdminMaterialItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  // Form states for manual create/edit
  const [formData, setFormData] = useState<MaterialInput>({
    title: '',
    courseCode: 'MB1201',
    courseName: 'Manajemen Keuangan',
    semester: 2,
    type: 'Catatan Kuliah',
    academicYear: '2025/2026',
    fileFormat: 'PDF',
    fileSize: '3.5 MB',
    author: 'Tim Dosen Manajemen Bisnis ITS',
    description: '',
    sampleUrl: '',
    tags: [],
    isPublished: true,
  });

  const [tagInput, setTagInput] = useState('');

  const typesList = [
    'Semua Tipe',
    'Catatan Kuliah',
    'Slide Dosen',
    'Soal UTS',
    'Soal UAS',
    'Panduan Praktikum',
    'Tugas Proyek',
  ];

  // Stats calculation
  const totalMaterials = materials.length;
  const pendingCount = materials.filter((m) => m.verificationStatus === 'PENDING').length;
  const approvedCount = materials.filter((m) => m.verificationStatus === 'APPROVED' || (m.is_published && m.verificationStatus !== 'REJECTED')).length;
  const rejectedCount = materials.filter((m) => m.verificationStatus === 'REJECTED').length;

  // Filtered materials
  const filteredMaterials = materials.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.courseCode.toLowerCase().includes(q) ||
      item.courseName.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q);

    const matchesType = selectedType === 'Semua Tipe' || item.type === selectedType;

    const currentStatus = item.verificationStatus || (item.is_published ? 'APPROVED' : 'PENDING');
    const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      title: '',
      courseCode: 'MB1201',
      courseName: 'Manajemen Keuangan',
      semester: 2,
      type: 'Catatan Kuliah',
      academicYear: '2025/2026',
      fileFormat: 'PDF',
      fileSize: '3.5 MB',
      author: 'Tim Dosen Manajemen Bisnis ITS',
      description: '',
      sampleUrl: '',
      tags: [],
      isPublished: true,
    });
    setTagInput('');
    setActionError(null);
  };

  // Status review handler (approve or reject)
  const handleReview = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await reviewMaterial(id, newStatus);
      if (res.success) {
        setMaterials((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  verificationStatus: newStatus,
                  is_published: newStatus === 'APPROVED',
                }
              : m
          )
        );
        setActionSuccess(
          newStatus === 'APPROVED'
            ? 'Materi berhasil disetujui dan kini aktif di katalog publik!'
            : 'Materi telah ditandai ditolak.'
        );
        router.refresh();
      } else {
        setActionError(res.error || 'Gagal mengubah status kurasi materi.');
      }
    });
  };

  // Open file document handler
  const handleOpenFile = async (materialId: string, storagePath: string) => {
    setLoadingFileId(materialId);
    try {
      const res = await getMaterialDownloadUrl(storagePath);
      if (res.url) {
        window.open(res.url, '_blank');
      } else {
        alert(res.error || 'Berkas tidak dapat dibuka.');
      }
    } catch {
      alert('Gagal memuat URL berkas.');
    } finally {
      setLoadingFileId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    startTransition(async () => {
      const res = await createMaterial(formData);
      if (res.success) {
        setIsCreateOpen(false);
        resetForm();
        setActionSuccess('Materi baru berhasil ditambahkan.');
        router.refresh();
      } else {
        setActionError(res.error || 'Gagal menambahkan materi.');
      }
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setActionError(null);

    startTransition(async () => {
      const res = await updateMaterial(editingItem.id, formData);
      if (res.success) {
        setEditingItem(null);
        resetForm();
        setActionSuccess('Perubahan materi berhasil disimpan.');
        router.refresh();
      } else {
        setActionError(res.error || 'Gagal memperbarui materi.');
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setActionError(null);

    startTransition(async () => {
      const res = await deleteMaterial(deletingItem.id);
      if (res.success) {
        setMaterials((prev) => prev.filter((m) => m.id !== deletingItem.id));
        setDeletingItem(null);
        setActionSuccess('Materi berhasil dihapus.');
        router.refresh();
      } else {
        setActionError(res.error || 'Gagal menghapus materi.');
      }
    });
  };

  const openEditModal = (item: AdminMaterialItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      courseCode: item.courseCode,
      courseName: item.courseName,
      semester: item.semester,
      type: item.type,
      academicYear: item.academicYear,
      fileFormat: item.fileFormat,
      fileSize: item.fileSize,
      author: item.author,
      description: item.description,
      sampleUrl: item.sampleUrl,
      tags: item.tags,
      isPublished: item.is_published ?? true,
    });
    setTagInput('');
    setActionError(null);
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData({ ...formData, tags: [...formData.tags, trimmed] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToRemove),
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
              Kelola & Kurasi Materi Kuliah
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live DB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Moderasi, tinjau berkas dokumen, dan setujui materi yang diunggah oleh mahasiswa atau dosen sebelum terbit.
          </p>
        </div>

        <PrimaryButton
          variant="brand"
          size="sm"
          icon={<Plus className="size-4" />}
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
        >
          Tambah Materi / Soal
        </PrimaryButton>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle className="size-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs text-rose-900 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <XCircle className="size-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
            Total Materi
          </span>
          <span className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1 block">
            {totalMaterials}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Semua berkas di sistem</span>
        </div>

        <div className="bg-amber-50/80 rounded-3xl p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Menunggu Kurasi
            </span>
            <Clock className="size-4 text-amber-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-950 mt-1 block">
            {pendingCount}
          </span>
          <span className="text-[10px] text-amber-800/80 mt-0.5 block">Perlu verifikasi & persetujuan</span>
        </div>

        <div className="bg-emerald-50/80 rounded-3xl p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Disetujui & Terbit
            </span>
            <CheckCircle className="size-4 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1 block">
            {approvedCount}
          </span>
          <span className="text-[10px] text-emerald-800/80 mt-0.5 block">Aktif di katalog publik</span>
        </div>

        <div className="bg-rose-50/80 rounded-3xl p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
              Ditolak
            </span>
            <XCircle className="size-4 text-rose-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-rose-950 mt-1 block">
            {rejectedCount}
          </span>
          <span className="text-[10px] text-rose-800/80 mt-0.5 block">Tidak dipublikasikan</span>
        </div>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white rounded-3xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari judul materi, mata kuliah, atau nama kontributor..."
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { key: 'ALL', label: 'Semua Materi' },
                { key: 'PENDING', label: `Menunggu Kurasi (${pendingCount})` },
                { key: 'APPROVED', label: `Disetujui (${approvedCount})` },
                { key: 'REJECTED', label: `Ditolak (${rejectedCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  statusFilter === tab.key
                    ? 'bg-neutral-900 text-white border-black shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border-neutral-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-neutral-100">
          {typesList.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedType === type
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border-2 border-black shadow-[6px_6px_0px_0px_#000] text-center space-y-3">
            <div className="grid place-items-center size-12 rounded-2xl bg-neutral-100 mx-auto text-neutral-400">
              <BookOpen className="size-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              Tidak Ada Materi Ditemukan
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Tidak ditemukan data materi yang cocok dengan filter atau kata kunci saat ini.
            </p>
          </div>
        ) : (
          filteredMaterials.map((item, idx) => {
            const currentStatus = item.verificationStatus || (item.is_published ? 'APPROVED' : 'PENDING');

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                  currentStatus === 'PENDING' ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                {/* Content Details */}
                <div className="space-y-3 flex-1">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-neutral-400">
                      #{idx + 1}
                    </span>

                    {currentStatus === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock className="size-3 text-amber-600" />
                        <span>Menunggu Kurasi</span>
                      </span>
                    )}

                    {currentStatus === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <CheckCircle className="size-3 text-emerald-600" />
                        <span>Disetujui & Terbit Publik</span>
                      </span>
                    )}

                    {currentStatus === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                        <XCircle className="size-3 text-rose-600" />
                        <span>Ditolak</span>
                      </span>
                    )}

                    <span className="font-mono text-[11px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-md">
                      {item.courseCode}
                    </span>
                    <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                      Sem {item.semester}
                    </span>
                    <Badge variant="brand" size="sm">
                      {item.type}
                    </Badge>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {item.fileFormat} • {item.fileSize}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-neutral-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Mata Kuliah: <strong className="text-neutral-800">{item.courseName}</strong>
                    </p>
                    {item.description && (
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed font-light">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Author & File Link */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 pt-1">
                    <div className="flex items-center gap-1.5 font-medium">
                      <User className="size-3.5 text-neutral-400 shrink-0" />
                      <span>
                        Pengunggah: <strong className="text-neutral-800">{item.author}</strong>
                      </span>
                    </div>

                    {item.sampleUrl && (
                      <button
                        type="button"
                        onClick={() => handleOpenFile(item.id, item.sampleUrl)}
                        disabled={loadingFileId === item.id}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-blue-50 px-3 py-1 rounded-xl border border-blue-200"
                      >
                        <FileText className="size-3.5" />
                        <span>{loadingFileId === item.id ? 'Membuka...' : 'Lihat / Unduh Dokumen'}</span>
                        <ExternalLink className="size-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                  {currentStatus === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleReview(item.id, 'APPROVED')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer border border-black"
                      >
                        <CheckCircle className="size-3.5" />
                        <span>Setujui (Approve)</span>
                      </button>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleReview(item.id, 'REJECTED')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer border border-rose-300"
                      >
                        <XCircle className="size-3.5" />
                        <span>Tolak</span>
                      </button>
                    </div>
                  )}

                  {currentStatus === 'APPROVED' && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleReview(item.id, 'REJECTED')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition cursor-pointer border border-neutral-300"
                      title="Batalkan penerbitan materi"
                    >
                      <RotateCcw className="size-3" />
                      <span>Tarik Publikasi</span>
                    </button>
                  )}

                  {currentStatus === 'REJECTED' && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleReview(item.id, 'APPROVED')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer border border-black"
                    >
                      <CheckCircle className="size-3.5" />
                      <span>Setujui Ulang</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      title="Edit Materi"
                      className="p-2 rounded-xl bg-white text-blue-600 border border-neutral-200 hover:bg-blue-50 transition cursor-pointer"
                    >
                      <Edit className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingItem(item)}
                      title="Hapus Materi"
                      className="p-2 rounded-xl bg-white text-rose-600 border border-neutral-200 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Tambah Materi Baru */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tambah Materi & Bank Soal Baru"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs sm:text-sm">
          {actionError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              {actionError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Judul Materi / Berkas Soal: *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Modul Praktikum Analisis Keuangan Lanjutan"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Kode Mata Kuliah:
              </label>
              <input
                type="text"
                required
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                placeholder="Contoh: MB1201 / BD1201"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Nama Mata Kuliah:
              </label>
              <input
                type="text"
                required
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                placeholder="Contoh: Manajemen Keuangan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Semester:
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value, 10) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Tipe Berkas:
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
              >
                {typesList
                  .filter((t) => t !== 'Semua Tipe')
                  .map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Format Berkas:
              </label>
              <select
                value={formData.fileFormat}
                onChange={(e) => setFormData({ ...formData, fileFormat: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
              >
                {['PDF', 'DOCX', 'XLSX', 'IPYNB', 'ZIP'].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Nama Kontributor / Penulis: *
            </label>
            <input
              type="text"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Nama dosen, laboratorium, atau mahasiswa"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Deskripsi Singkat Materi:
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Rangkuman pokok materi atau instruksi soal..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Tag / Topik:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Ketik topik lalu tekan enter atau klik Tambah"
                className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 text-xs"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold cursor-pointer"
              >
                Tambah
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="hover:text-rose-600 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
            <SecondaryButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Batal
            </SecondaryButton>
            <PrimaryButton type="submit" variant="brand" size="sm" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan & Publikasikan'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Materi */}
      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title="Edit Data Materi & Soal"
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs sm:text-sm">
            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                {actionError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Judul Materi / Berkas Soal: *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Kode Mata Kuliah:
                </label>
                <input
                  type="text"
                  required
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Nama Mata Kuliah:
                </label>
                <input
                  type="text"
                  required
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Semester:
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Tipe Berkas:
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
                >
                  {typesList
                    .filter((t) => t !== 'Semua Tipe')
                    .map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Nama Kontributor:
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Deskripsi Singkat:
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
              <SecondaryButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingItem(null)}
              >
                Batal
              </SecondaryButton>
              <PrimaryButton type="submit" variant="brand" size="sm" disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Hapus Materi */}
      {deletingItem && (
        <Modal
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          title="Konfirmasi Hapus Materi"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-neutral-600">
              Apakah Anda yakin ingin menghapus materi berikut secara permanen?
            </p>
            <div className="p-3 bg-neutral-100 rounded-xl font-bold text-neutral-900">
              {deletingItem.title}
            </div>
            <p className="text-xs text-rose-600">
              Tindakan ini permanen dan berkas akan dihapus dari sistem.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <SecondaryButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingItem(null)}
              >
                Batal
              </SecondaryButton>
              <PrimaryButton
                type="button"
                variant="dark"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? 'Menghapus...' : 'Ya, Hapus'}
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
