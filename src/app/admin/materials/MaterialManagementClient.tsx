'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  AdminMaterialItem,
  MaterialInput,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  addSimulatedVisits,
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
  Flame,
  Clock,
  Eye,
  Download,
  Layers,
  AlertTriangle,
  Zap,
  TrendingUp,
  Radio,
  Share2,
} from 'lucide-react';

interface Props {
  initialMaterials: AdminMaterialItem[];
  error?: string;
}

export function MaterialManagementClient({ initialMaterials, error }: Props) {
  const [materials, setMaterials] = useState<AdminMaterialItem[]>(initialMaterials);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Semua Tipe');
  const [sortTimeframe, setSortTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMaterialItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<AdminMaterialItem | null>(null);
  const [simulatingItemId, setSimulatingItemId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form states
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
  const totalViewsToday = materials.reduce((acc, m) => acc + (m.viewsToday || 0), 0);
  const totalViewsWeek = materials.reduce((acc, m) => acc + (m.viewsWeek || 0), 0);
  const totalViewsMonth = materials.reduce((acc, m) => acc + (m.viewsMonth || 0), 0);
  const totalViewsAll = materials.reduce((acc, m) => acc + (m.total_views || 0), 0);

  // Sort and filter
  const filteredAndSorted = materials
    .filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.courseCode.toLowerCase().includes(q) ||
        item.courseName.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q);

      const matchesType = selectedType === 'Semua Tipe' || item.type === selectedType;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortTimeframe === 'today') return (b.viewsToday || 0) - (a.viewsToday || 0);
      if (sortTimeframe === 'week') return (b.viewsWeek || 0) - (a.viewsWeek || 0);
      if (sortTimeframe === 'month') return (b.viewsMonth || 0) - (a.viewsMonth || 0);
      return (b.total_views || 0) - (a.total_views || 0);
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
      tags: ['Bisnis', 'Akademik'],
      isPublished: true,
    });
    setTagInput('Bisnis, Akademik');
    setActionError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (item: AdminMaterialItem) => {
    setActionError(null);
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
      tags: item.tags || [],
      isPublished: item.is_published ?? true,
    });
    setTagInput((item.tags || []).join(', '));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setActionError('Judul materi wajib diisi');
      return;
    }

    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await createMaterial({
        ...formData,
        tags: parsedTags,
      });

      if (res.success && res.data) {
        setMaterials((prev) => [
          {
            id: res.data.id,
            title: res.data.title,
            courseCode: res.data.course_code,
            courseName: res.data.course_name,
            semester: res.data.semester,
            type: res.data.type,
            academicYear: res.data.academic_year,
            fileFormat: res.data.file_format,
            fileSize: res.data.file_size,
            uploadedAt: new Date(res.data.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            downloadCount: 0,
            total_views: 0,
            viewsToday: 0,
            viewsWeek: 0,
            viewsMonth: 0,
            author: res.data.author,
            description: res.data.description,
            sampleUrl: res.data.sample_url,
            tags: parsedTags,
            is_published: res.data.is_published,
          },
          ...prev,
        ]);
        setIsCreateOpen(false);
      } else {
        setActionError(res.error || 'Gagal membuat materi');
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await updateMaterial(editingItem.id, {
        ...formData,
        tags: parsedTags,
      });

      if (res.success) {
        setMaterials((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? ({
                  ...item,
                  ...formData,
                  type: formData.type as any,
                  fileFormat: formData.fileFormat as any,
                  tags: parsedTags,
                } as AdminMaterialItem)
              : item
          )
        );
        setEditingItem(null);
      } else {
        setActionError(res.error || 'Gagal memperbarui materi');
      }
    });
  };

  const handleDeleteSubmit = () => {
    if (!deletingItem) return;
    startTransition(async () => {
      const res = await deleteMaterial(deletingItem.id);
      if (res.success) {
        setMaterials((prev) => prev.filter((i) => i.id !== deletingItem.id));
        setDeletingItem(null);
      } else {
        setActionError(res.error || 'Gagal menghapus materi');
      }
    });
  };

  const handleSimulateVisits = (materialId: string, timeframe: 'today' | 'week' | 'month', count: number) => {
    setSimulatingItemId(materialId);
    startTransition(async () => {
      const res = await addSimulatedVisits(materialId, timeframe, count);
      if (res.success) {
        setMaterials((prev) =>
          prev.map((item) => {
            if (item.id === materialId) {
              return {
                ...item,
                total_views: (item.total_views || 0) + count,
                viewsToday: timeframe === 'today' ? (item.viewsToday || 0) + count : item.viewsToday,
                viewsWeek:
                  timeframe === 'today' || timeframe === 'week'
                    ? (item.viewsWeek || 0) + count
                    : item.viewsWeek,
                viewsMonth: (item.viewsMonth || 0) + count,
              };
            }
            return item;
          })
        );
      }
      setSimulatingItemId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Kelola Materi & Bank Soal
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="size-3 text-emerald-500 animate-pulse" />
              Live DB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Data materi dan bank soal diurutkan real-time di beranda berdasarkan kurun waktu kunjungan mahasiswa.
          </p>
        </div>

        <PrimaryButton
          type="button"
          variant="brand"
          size="md"
          icon={<Plus className="size-4" />}
          onClick={openCreateModal}
        >
          Tambah Materi / Soal
        </PrimaryButton>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Total Materi</p>
          <p className="text-2xl font-black text-neutral-900 mt-1">{totalMaterials}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
            <span>⚡ Hari Ini</span>
          </p>
          <p className="text-2xl font-black text-blue-600 mt-1">{totalViewsToday}</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">24 Jam Terakhir</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
            <span>🔥 Minggu Ini</span>
          </p>
          <p className="text-2xl font-black text-amber-600 mt-1">{totalViewsWeek}</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">7 Hari Terakhir</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
            <span>📈 Bulan Ini</span>
          </p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{totalViewsMonth}</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">30 Hari Terakhir</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] col-span-2 lg:col-span-1">
          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Total Kunjungan</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{totalViewsAll.toLocaleString()}</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">Sepanjang Waktu</p>
        </div>
      </div>

      {/* Sorting by Timeframe Bar */}
      <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-neutral-600 flex items-center gap-1">
            <Clock className="size-4 text-blue-600" />
            Urutkan Kunjungan Sesuai Beranda:
          </span>
          {[
            { key: 'today' as const, label: 'Hari Ini (⚡ 24 Jam)' },
            { key: 'week' as const, label: 'Minggu Ini (🔥 7 Hari)' },
            { key: 'month' as const, label: 'Bulan Ini (📈 30 Hari)' },
            { key: 'all' as const, label: 'Semua Waktu (🏆 Total)' },
          ].map((tf) => (
            <button
              key={tf.key}
              type="button"
              onClick={() => setSortTimeframe(tf.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                sortTimeframe === tf.key
                  ? 'bg-neutral-900 text-white border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-neutral-300'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-neutral-500 flex items-center gap-1.5">
          <Zap className="size-3.5 text-amber-500" />
          <span>Gunakan tombol petir di tiap baris untuk simulasi kunjungan langsung</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            onClear={() => setSearchQuery('')}
            placeholder="Cari judul materi, kode mata kuliah, atau nama dosen..."
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {typesList.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedType(t)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedType === t
                  ? 'bg-blue-600 text-white border border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-3">
        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_#000] p-8">
            <BookOpen className="size-10 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-800">Tidak ada materi ditemukan</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Coba sesuaikan kata kunci pencarian atau tambahkan materi baru.
            </p>
          </div>
        ) : (
          filteredAndSorted.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 flex-1">
                <span className="grid place-items-center size-8 rounded-xl bg-neutral-100 text-neutral-700 font-bold text-xs shrink-0 mt-0.5">
                  #{index + 1}
                </span>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-mono font-bold bg-neutral-900 text-white px-2.5 py-0.5 rounded-full">
                      {item.courseCode}
                    </span>
                    <Badge variant="brand" size="sm">
                      Sem {item.semester}
                    </Badge>
                    <Badge variant="yellow" size="sm">
                      {item.type}
                    </Badge>
                    <span className="text-xs text-neutral-500">
                      {item.fileFormat} • {item.fileSize}
                    </span>
                    {item.is_published === false && (
                      <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                        Draf Privat
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-neutral-900 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-neutral-600 line-clamp-1">
                    <span className="font-semibold text-neutral-700">{item.courseName}</span> • {item.author}
                  </p>

                  {/* Visit metrics breakdown */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                      ⚡ Hari Ini: {item.viewsToday || 0}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-100">
                      🔥 Minggu Ini: {item.viewsWeek || 0}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                      📈 Bulan Ini: {item.viewsMonth || 0}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-semibold">
                      🏆 Total: {item.total_views || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons & simulation */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center flex-wrap">
                {/* Simulated Visit Buttons for Live Testing */}
                <div className="flex items-center gap-1 bg-neutral-50 p-1 rounded-xl border border-neutral-200">
                  <span className="text-[10px] font-bold text-neutral-500 px-1.5">+Hit:</span>
                  <button
                    type="button"
                    onClick={() => handleSimulateVisits(item.id, 'today', 5)}
                    disabled={isPending || simulatingItemId === item.id}
                    title="Tambah +5 kunjungan Hari Ini untuk tes real-time"
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition cursor-pointer border border-neutral-200"
                  >
                    +5 Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateVisits(item.id, 'week', 10)}
                    disabled={isPending || simulatingItemId === item.id}
                    title="Tambah +10 kunjungan Minggu Ini"
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white text-amber-600 hover:bg-amber-600 hover:text-white transition cursor-pointer border border-neutral-200"
                  >
                    +10 Minggu
                  </button>
                </div>

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
          ))
        )}
      </div>

      {/* Modal: Tambah Materi */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tambah Materi & Bank Soal Baru"
        size="md"
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
                {typesList.filter((t) => t !== 'Semua Tipe').map((t) => (
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
                {['PDF', 'IPYNB', 'DOCX', 'ZIP', 'XLSX'].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Ukuran Berkas:
              </label>
              <input
                type="text"
                value={formData.fileSize}
                onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                placeholder="Contoh: 3.8 MB"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Penulis / Pengunggah:
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Contoh: Tim Dosen Manajemen Keuangan ITS"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Deskripsi Singkat Materi:
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan ringkasan isi slide atau kisi-kisi bank soal..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Tags (pisahkan dengan koma):
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Contoh: Keuangan, Valuasi, UTS"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="size-4 text-blue-600 rounded"
              />
              <span>Publikasikan Langsung ke Beranda</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
            <SecondaryButton
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsCreateOpen(false)}
            >
              Batal
            </SecondaryButton>
            <PrimaryButton type="submit" variant="brand" size="md" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan Materi'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Materi */}
      <Modal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="Edit Materi / Bank Soal"
        size="md"
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
                {typesList.filter((t) => t !== 'Semua Tipe').map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Format:
              </label>
              <select
                value={formData.fileFormat}
                onChange={(e) => setFormData({ ...formData, fileFormat: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
              >
                {['PDF', 'IPYNB', 'DOCX', 'ZIP', 'XLSX'].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Deskripsi Materi:
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Tags:
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="size-4 text-blue-600 rounded"
              />
              <span>Status Terbit Publik</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
            <SecondaryButton
              type="button"
              variant="outline"
              size="md"
              onClick={() => setEditingItem(null)}
            >
              Batal
            </SecondaryButton>
            <PrimaryButton type="submit" variant="brand" size="md" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Perbarui Materi'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Konfirmasi Hapus */}
      <Modal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        title="Hapus Materi"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
            <AlertTriangle className="size-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Hapus materi ini?</p>
              <p className="mt-1">
                Materi <span className="font-semibold">&ldquo;{deletingItem?.title}&rdquo;</span> beserta riwayat kunjungannya akan dihapus secara permanen.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <SecondaryButton
              type="button"
              variant="outline"
              size="md"
              onClick={() => setDeletingItem(null)}
            >
              Batal
            </SecondaryButton>
            <button
              type="button"
              onClick={handleDeleteSubmit}
              disabled={isPending}
              className="px-4 py-2 rounded-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer"
            >
              {isPending ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
