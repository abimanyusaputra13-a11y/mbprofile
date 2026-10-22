'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Announcement } from '@/types';
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementPin,
  toggleAnnouncementPublish,
  AnnouncementInput,
} from '@/lib/actions/announcements';
import { Badge } from '@/components/ui/Badge';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { SearchInput } from '@/components/ui/SearchInput';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  BellRing,
  Edit,
  Trash2,
  Pin,
  Eye,
  EyeOff,
  Calendar,
  ExternalLink,
  AlertTriangle,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  initialAnnouncements: Announcement[];
  error?: string;
}

export function AnnouncementManagementClient({ initialAnnouncements, error }: Props) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [deletingItem, setDeletingItem] = useState<Announcement | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<AnnouncementInput>({
    title: '',
    category: 'Akademik',
    summary: '',
    displayDate: '',
    isPinned: false,
    linkText: 'Selengkapnya',
    linkUrl: '/about',
    isPublished: true,
  });

  const categories = ['Semua Kategori', 'Akademik', 'Kompetisi', 'Organisasi', 'Beasiswa', 'Kegiatan'];

  const filtered = announcements.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === 'Semua Kategori' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Akademik',
      summary: '',
      displayDate: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      isPinned: false,
      linkText: 'Selengkapnya',
      linkUrl: '/about',
      isPublished: true,
    });
    setActionError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (item: Announcement) => {
    setActionError(null);
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      summary: item.summary,
      displayDate: item.date,
      isPinned: item.isPinned ?? false,
      linkText: item.linkText || '',
      linkUrl: item.linkUrl || '',
      isPublished: item.isPublished ?? true,
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setActionError('Judul pengumuman wajib diisi');
      return;
    }

    startTransition(async () => {
      const res = await createAnnouncement(formData);
      if (res.success && res.data) {
        setAnnouncements((prev) => [
          {
            id: res.data.id,
            title: res.data.title,
            date: res.data.display_date,
            category: res.data.category,
            summary: res.data.summary,
            isPinned: res.data.is_pinned,
            linkText: res.data.link_text,
            linkUrl: res.data.link_url,
            isPublished: res.data.is_published,
          },
          ...prev,
        ]);
        setIsCreateOpen(false);
      } else {
        setActionError(res.error || 'Gagal membuat pengumuman');
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    startTransition(async () => {
      const res = await updateAnnouncement(editingItem.id, formData);
      if (res.success) {
        setAnnouncements((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  title: formData.title,
                  category: formData.category,
                  summary: formData.summary,
                  date: formData.displayDate || item.date,
                  isPinned: formData.isPinned,
                  linkText: formData.linkText,
                  linkUrl: formData.linkUrl,
                  isPublished: formData.isPublished,
                }
              : item
          )
        );
        setEditingItem(null);
      } else {
        setActionError(res.error || 'Gagal memperbarui pengumuman');
      }
    });
  };

  const handleDeleteSubmit = () => {
    if (!deletingItem) return;
    startTransition(async () => {
      const res = await deleteAnnouncement(deletingItem.id);
      if (res.success) {
        setAnnouncements((prev) => prev.filter((i) => i.id !== deletingItem.id));
        setDeletingItem(null);
      } else {
        setActionError(res.error || 'Gagal menghapus pengumuman');
      }
    });
  };

  const handleTogglePin = (item: Announcement) => {
    const nextPinned = !item.isPinned;
    startTransition(async () => {
      await toggleAnnouncementPin(item.id, nextPinned);
      setAnnouncements((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isPinned: nextPinned } : i))
      );
    });
  };

  const handleTogglePublish = (item: Announcement) => {
    const nextPublished = !(item.isPublished ?? true);
    startTransition(async () => {
      await toggleAnnouncementPublish(item.id, nextPublished);
      setAnnouncements((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isPublished: nextPublished } : i))
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Kelola Pengumuman & Agenda
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="size-3 text-emerald-500 animate-pulse" />
              Live DB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Pengumuman yang dibuat di sini langsung tampil secara dinamis pada halaman utama website.
          </p>
        </div>

        <PrimaryButton
          type="button"
          variant="brand"
          size="md"
          icon={<Plus className="size-4" />}
          onClick={openCreateModal}
        >
          Tambah Pengumuman
        </PrimaryButton>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Pengumuman</p>
          <p className="text-2xl font-black text-neutral-900 mt-1">{announcements.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Disematkan di Atas</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {announcements.filter((a) => a.isPinned).length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status Terbit</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {announcements.filter((a) => a.isPublished !== false).length}
          </p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            onClear={() => setSearchQuery('')}
            placeholder="Cari judul, ringkasan, atau kategori pengumuman..."
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-black shadow-[6px_6px_0px_0px_#000] p-8">
            <BellRing className="size-10 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-800">Tidak ada pengumuman ditemukan</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Coba sesuaikan kata kunci pencarian atau buat pengumuman baru.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.isPinned && (
                    <span className="text-[10px] font-bold uppercase bg-amber-400 text-neutral-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Pin className="size-2.5 fill-current" />
                      Disematkan
                    </span>
                  )}
                  <Badge variant="brand" size="sm">
                    {item.category}
                  </Badge>
                  <span className="text-xs text-neutral-400 font-mono">
                    {item.date}
                  </span>
                  {item.isPublished === false && (
                    <span className="text-[10px] font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                      Draf (Tersembunyi)
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-neutral-900 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>

                {item.linkUrl && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium pt-1">
                    <ExternalLink className="size-3" />
                    <span>Tautan: {item.linkText || item.linkUrl}</span>
                    <span className="text-neutral-400 font-mono text-[11px]">({item.linkUrl})</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleTogglePin(item)}
                  title={item.isPinned ? 'Lepas Sematan' : 'Sematkan di Atas'}
                  className={`p-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                    item.isPinned
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <Pin className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleTogglePublish(item)}
                  title={item.isPublished === false ? 'Terbitkan' : 'Sembunyikan'}
                  className={`p-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                    item.isPublished !== false
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
                  }`}
                >
                  {item.isPublished !== false ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  title="Edit Pengumuman"
                  className="p-2 rounded-xl bg-white text-blue-600 border border-neutral-200 hover:bg-blue-50 transition cursor-pointer"
                >
                  <Edit className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingItem(item)}
                  title="Hapus Pengumuman"
                  className="p-2 rounded-xl bg-white text-rose-600 border border-neutral-200 hover:bg-rose-50 transition cursor-pointer"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Tambah Pengumuman */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tambah Pengumuman Baru"
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
              Judul Pengumuman: *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Pendaftaran MBKM & Studi Independen Bersertifikat"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Kategori:
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
              >
                {categories.filter((c) => c !== 'Semua Kategori').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Tanggal Tampil:
              </label>
              <input
                type="text"
                value={formData.displayDate}
                onChange={(e) => setFormData({ ...formData, displayDate: e.target.value })}
                placeholder="Contoh: 15 Februari 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Ringkasan Berita / Agenda: *
            </label>
            <textarea
              rows={3}
              required
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Tuliskan ringkasan 2–3 kalimat yang akan tampil di beranda..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Teks Tombol Tautan:
              </label>
              <input
                type="text"
                value={formData.linkText || ''}
                onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                placeholder="Contoh: Informasi Selengkapnya"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                URL Tautan:
              </label>
              <input
                type="text"
                value={formData.linkUrl || ''}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="Contoh: /about atau https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="size-4 text-blue-600 rounded"
              />
              <span>Sematkan di Atas (Pinned)</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="size-4 text-blue-600 rounded"
              />
              <span>Terbitkan Langsung ke Publik</span>
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
              {isPending ? 'Menyimpan...' : 'Simpan Pengumuman'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Pengumuman */}
      <Modal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="Edit Pengumuman"
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
              Judul Pengumuman: *
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
                Kategori:
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 bg-white"
              >
                {categories.filter((c) => c !== 'Semua Kategori').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Tanggal Tampil:
              </label>
              <input
                type="text"
                value={formData.displayDate}
                onChange={(e) => setFormData({ ...formData, displayDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Ringkasan Berita / Agenda: *
            </label>
            <textarea
              rows={3}
              required
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Teks Tombol Tautan:
              </label>
              <input
                type="text"
                value={formData.linkText || ''}
                onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                URL Tautan:
              </label>
              <input
                type="text"
                value={formData.linkUrl || ''}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="size-4 text-blue-600 rounded"
              />
              <span>Sematkan di Atas (Pinned)</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="size-4 text-blue-600 rounded"
              />
              <span>Status Diterbitkan Publik</span>
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
              {isPending ? 'Menyimpan...' : 'Perbarui Pengumuman'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Konfirmasi Hapus */}
      <Modal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        title="Hapus Pengumuman"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
            <AlertTriangle className="size-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Apakah Anda yakin ingin menghapus?</p>
              <p className="mt-1">
                Pengumuman <span className="font-semibold">&ldquo;{deletingItem?.title}&rdquo;</span> akan dihapus permanen dari database.
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
