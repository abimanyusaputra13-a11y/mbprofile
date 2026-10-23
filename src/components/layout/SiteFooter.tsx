import React from 'react';
import Link from 'next/link';
import { PRIMARY_NAV_ROUTES } from '@/data/navigation';
import { Mail, MapPin, Globe, ShieldCheck, ExternalLink } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-neutral-200/80 bg-gradient-to-b from-white via-blue-50/40 to-blue-100/60">
      <div className="mx-auto max-w-[1440px] px-4 pt-16 pb-12 sm:px-8 sm:pt-24 sm:pb-16 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-neutral-200/80">
          {/* Brand & Signature "Connect with us" */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-3xl sm:text-5xl font-black text-neutral-900 leading-none tracking-tight">
                Connect
                <span className="text-script block pl-8 sm:pl-14 text-2xl sm:text-4xl font-normal text-blue-600">
                  with us
                </span>
              </p>
              <p className="mt-4 text-sm text-neutral-600 max-w-md leading-relaxed">
                Portal resmi akademik dan informasi Departemen Manajemen Bisnis, Fakultas Desain Kreatif dan Bisnis Digital (FDKBD / CREABIZ), Institut Teknologi Sepuluh Nopember (ITS). Menaungi program sarjana S1 Manajemen Bisnis dan S1 Bisnis Digital.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="https://www.instagram.com/manyuu.sptr/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-blue-600 hover:border-blue-400 transition shadow-2xs"
              >
                <svg className="size-4 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                <span>@manyuu.sptr</span>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-black hover:border-neutral-400 transition shadow-2xs"
              >
                <svg className="size-4 text-neutral-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                  <path d="M9 18c-4.51 2-5-2-7-2"/>
                </svg>
                <span>GitHub Org</span>
              </a>
              <a
                href="https://www.linkedin.com/in/abimanyu-hadi-saputra"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-blue-700 hover:border-blue-400 transition shadow-2xs"
              >
                <svg className="size-4 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>

            {/* Accreditation Badge */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs max-w-sm">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <ShieldCheck className="size-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-neutral-900">Akreditasi Unggul & FIBAA</p>
                <p className="text-[11px] text-neutral-500">Masa Berlaku FIBAA 2025–2030</p>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-3 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-900">
              Navigasi Halaman
            </p>
            <ul className="space-y-2.5 text-sm">
              {PRIMARY_NAV_ROUTES.map((route) => (
                <li key={route.path}>
                  <Link
                    href={route.path}
                    className="text-neutral-600 hover:text-blue-600 hover:underline transition-colors flex items-center justify-between group"
                  >
                    <span>{route.name}</span>
                    <span className="text-xs text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Location Column */}
          <div className="lg:col-span-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-900">
              Sekretariat & Alamat
            </p>
            <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="size-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Departemen Manajemen Bisnis, Fakultas Desain Kreatif dan Bisnis Digital (CREABIZ), Kampus ITS, Jl. Raya ITS, Sukolilo, Surabaya 60111, Jawa Timur, Indonesia
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 text-blue-600 shrink-0" />
                <a href="mailto:mbisnis@its.ac.id" className="hover:underline text-neutral-800">
                  mbisnis@its.ac.id
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="size-4 text-blue-600 shrink-0" />
                <span className="text-neutral-800">Senin – Jumat: 08.00 – 16.30 WIB</span>
              </div>
            </div>

            <div className="pt-3">
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                Portal Terkait:
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <a
                  href="https://www.its.ac.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  Situs Utama ITS <ExternalLink className="size-2.5" />
                </a>
                <span className="text-neutral-300">•</span>
                <a
                  href="https://www.its.ac.id/mb/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  Departemen MB ITS <ExternalLink className="size-2.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 Departemen Manajemen Bisnis, Institut Teknologi Sepuluh Nopember (ITS). Seluruh hak cipta dilindungi undang-undang.</p>
        </div>
      </div>
    </footer>
  );
};
