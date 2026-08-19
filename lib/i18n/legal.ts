import type { Locale } from "@/lib/i18n/landing";

export type LegalChrome = {
  homeLabel: string;
  alsoRead: string;
  lastUpdatedPrefix: string;
  loadError: string;
  loading: string;
};

export const legalChrome: Record<Locale, LegalChrome> = {
  id: {
    homeLabel: "Kembali ke beranda",
    alsoRead: "Baca juga",
    lastUpdatedPrefix: "Terakhir diperbarui",
    loadError: "Tidak bisa memuat dokumen. Coba muat ulang halaman.",
    loading: "Memuat dokumen…",
  },
  en: {
    homeLabel: "Back to home",
    alsoRead: "Also read",
    lastUpdatedPrefix: "Last updated",
    loadError: "Could not load this document. Try refreshing the page.",
    loading: "Loading document…",
  },
};
