'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Achievement } from '@/types';
import {
  reviewAchievement,
  deleteAchievement,
  getCertificateDownloadUrl,
} from '@/lib/actions/achievements';
import { Badge } from '@/components/ui/Badge';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { SearchInput } from '@/components/ui/SearchInput';
import { Modal } from '@/components/ui/Modal';
import {
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  ExternalLink,
  Users,
  Award,
  Calendar,
  FileCheck,
  Building,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface Props {
  initialAchievements: Achievement[];
  error?: string;
}

export function AchievementManagementClient({ initialAchievements, error }: Props) {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [isPending, startTransition] = useTransition();

  // Modals / action states
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [deletingItem, setDeletingItem] = useState<Achievement | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [loadingCertificate, setLoadingCertificate] = useState(false);

  // Statistics
  const totalCount = achievements.length;
  const pendingCount = achievements.filter((a) => a.verificationStatus === 'PENDING').length;
  const approvedCount = achievements.filter((a) => a.verificationStatus === 'APPROVED').length;
  const rejectedCount = achievements.filter((a) => a.verificationStatus === 'REJECTED').length;

  // Filtered achievements
  const filtered = achievements.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.award.toLowerCase().includes(q) ||
      item.eventOrganizer.toLowerCase().includes(q) ||
      item.members.some((m) => m.toLowerCase().includes(q)) ||
      (item.teamName && item.teamName.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' || item.verificationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setActionError(null);
    setActionSuccess(null);

    startTransition(async () => {
      const res = await reviewAchievement(id, newStatus);
      if (res.success) {
        setAchievements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, verificationStatus: newStatus } : a))
        );
        setActionSuccess(
          newStatus === 'APPROVED'
            ? 'Laporan berhasil disetujui dan kini tayang di publik Wall of Fame!'
            : 'Laporan telah ditandai ditolak.'
        );
        router.refresh();
      } else {
        setActionError(res.error || 'Gagal memperbarui status laporan.');
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setActionError(null);

    startTransition(async () => {
      const res = await deleteAchievement(deletingItem.id);
      if (res.success) {
        setAchievements((prev) => prev.filter((a) => a.id !== deletingItem.id));
        setDeletingItem(null);
        setActionSuccess('Laporan prestasi berhasil dihapus.');
        router.refresh();
      } else {
        setActionError(res.error || 'Gagal menghapus laporan.');
      }
    });
  };

  const handleOpenCertificate = async (storageKey: string) => {
    setLoadingCertificate(true);
    try {
      const res = await getCertificateDownloadUrl(storageKey);
      if (res.url) {
        window.open(res.url, '_blank');
      } else {
        alert(res.error || 'Tidak dapat membuka tautan sertifikat.');
      }
    } catch {
      alert('Gagal memuat sertifikat.');
    } finally {
      setLoadingCertificate(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
                Kurasi & Moderasi Prestasi Mahasiswa
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Live DB
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Verifikasi dan setujui laporan capaian kompetisi yang diajukan mahasiswa agar tayang di Wall of Fame.
            </p>
          </div>
        </div>
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
            Total Laporan
          </span>
          <span className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1 block">
            {totalCount}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Semua pengajuan prestasi</span>
        </div>

        <div className="bg-amber-50/80 rounded-3xl p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Menunggu Review
            </span>
            <Clock className="size-4 text-amber-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-950 mt-1 block">
            {pendingCount}
          </span>
          <span className="text-[10px] text-amber-800/80 mt-0.5 block">Memerlukan persetujuan admin</span>
        </div>

        <div className="bg-emerald-50/80 rounded-3xl p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Disetujui (Approved)
            </span>
            <CheckCircle className="size-4 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1 block">
            {approvedCount}
          </span>
          <span className="text-[10px] text-emerald-800/80 mt-0.5 block">Aktif di publik Wall of Fame</span>
        </div>

        <div className="bg-rose-50/80 rounded-3xl p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
              Ditolak (Rejected)
            </span>
            <XCircle className="size-4 text-rose-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-rose-950 mt-1 block">
            {rejectedCount}
          </span>
          <span className="text-[10px] text-rose-800/80 mt-0.5 block">Tidak dipublikasikan</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari ajang, nama mahasiswa, penghargaan, penyelenggara..."
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { key: 'ALL', label: 'Semua' },
                { key: 'PENDING', label: `Pending (${pendingCount})` },
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
      </div>

      {/* Achievements List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border-2 border-black shadow-[6px_6px_0px_0px_#000] text-center space-y-3">
            <div className="grid place-items-center size-12 rounded-2xl bg-neutral-100 mx-auto text-neutral-400">
              <Trophy className="size-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              Tidak Ada Laporan Prestasi
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Tidak ditemukan data laporan prestasi dengan filter atau kata kunci saat ini.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                item.verificationStatus === 'PENDING'
                  ? 'ring-2 ring-amber-400'
                  : ''
              }`}
            >
              <div className="space-y-3 flex-1">
                {/* Badges & Meta */}
                <div className="flex flex-wrap items-center gap-2">
                  {item.verificationStatus === 'PENDING' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      <Clock className="size-3 text-amber-600" />
                      <span>Menunggu Review</span>
                    </span>
                  )}
                  {item.verificationStatus === 'APPROVED' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      <CheckCircle className="size-3 text-emerald-600" />
                      <span>Disetujui & Tayang Publik</span>
                    </span>
                  )}
                  {item.verificationStatus === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                      <XCircle className="size-3 text-rose-600" />
                      <span>Ditolak</span>
                    </span>
                  )}

                  <Badge variant="brand" size="sm">
                    {item.category}
                  </Badge>
                  <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                    {item.level}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-neutral-600">
                    Tahun {item.year}
                  </span>
                </div>

                {/* Title & Award */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-900 leading-snug">
                    {item.title}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 mt-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <Trophy className="size-3.5 text-amber-600 shrink-0" />
                    <span>{item.award}</span>
                  </div>
                </div>

                {/* Members & Details */}
                <div className="text-xs text-neutral-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users className="size-3.5 text-neutral-400 shrink-0" />
                    <span>
                      <strong className="text-neutral-800">Mahasiswa:</strong>{' '}
                      {item.members.join(', ')}
                      {item.teamName ? ` (Tim: ${item.teamName})` : ''}
                    </span>
                  </div>
                  {item.eventOrganizer && (
                    <div className="flex items-center gap-1.5">
                      <Building className="size-3.5 text-neutral-400 shrink-0" />
                      <span>Penyelenggara: {item.eventOrganizer}</span>
                    </div>
                  )}
                  {item.description && (
                    <div className="pt-1">
                      <p className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 leading-relaxed">
                        <strong className="font-semibold text-neutral-800">Deskripsi:</strong> {item.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Documentation photo thumbnail if present */}
                {item.photoUrl && (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-neutral-600 mb-1">Foto Dokumentasi:</p>
                    <img
                      src={item.photoUrl}
                      alt={item.title}
                      className="w-36 h-24 object-cover rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                    />
                  </div>
                )}

                {/* Certificate link if present */}
                {item.certificateStorageKey && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenCertificate(item.certificateStorageKey!)}
                      disabled={loadingCertificate}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-blue-50 px-3 py-1 rounded-xl border border-blue-200"
                    >
                      <FileCheck className="size-3.5" />
                      <span>Lihat Bukti Sertifikat / SK</span>
                      <ExternalLink className="size-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                {item.verificationStatus === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleStatusChange(item.id, 'APPROVED')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer border border-black"
                    >
                      <CheckCircle className="size-3.5" />
                      <span>Setujui (Approve)</span>
                    </button>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleStatusChange(item.id, 'REJECTED')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer border border-rose-300"
                    >
                      <XCircle className="size-3.5" />
                      <span>Tolak</span>
                    </button>
                  </div>
                )}

                {item.verificationStatus === 'APPROVED' && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatusChange(item.id, 'REJECTED')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition cursor-pointer border border-neutral-300"
                    title="Batalkan persetujuan"
                  >
                    <RotateCcw className="size-3" />
                    <span>Batalkan Persetujuan</span>
                  </button>
                )}

                {item.verificationStatus === 'REJECTED' && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatusChange(item.id, 'APPROVED')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer border border-black"
                  >
                    <CheckCircle className="size-3.5" />
                    <span>Setujui Ulang</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDeletingItem(item)}
                  title="Hapus Laporan"
                  className="p-2 rounded-xl bg-white text-rose-600 border border-neutral-200 hover:bg-rose-50 transition cursor-pointer"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <Modal
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          title="Konfirmasi Hapus Laporan Prestasi"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-neutral-600">
              Apakah Anda yakin ingin menghapus data laporan prestasi:
            </p>
            <div className="p-3 bg-neutral-100 rounded-xl font-bold text-neutral-900">
              {deletingItem.title} ({deletingItem.award})
            </div>
            <p className="text-xs text-rose-600">
              Tindakan ini permanen dan tidak dapat dibatalkan.
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
