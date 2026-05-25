export type Region = {
  id: string;
  name: string;
  code: string;
};

export type Country = {
  id: string;
  name: string;
  code: string;
  regionId: string;
};

export type City = {
  id: string;
  name: string;
  countryId: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor";
  status: "active" | "inactive";
};

/** Nested geo on each tag row from GET /document-guide (BE). */
export type DocumentGuideGeoRef = {
  id: number;
  name: string;
} | null;

export type DocumentGuideStructuredTag = {
  id: number;
  region: DocumentGuideGeoRef;
  country: DocumentGuideGeoRef;
  city: DocumentGuideGeoRef;
};

export type DocumentGuideCoverImage = {
  id: string;
  url: string;
  sortOrder: number;
};

export type DocumentGuide = {
  id: string;
  titleId: string;
  titleEn: string | null;
  /** Display title (titleId) for tables */
  title: string;
  tripDays: number | null;
  coverImages: DocumentGuideCoverImage[];
  coverImageUrl: string | null;
  /** Harga dalam Rupiah (IDR) */
  priceIdr: number;
  /** Harga dalam Dolar AS (USD) */
  priceUsd: number;
  /** Satu atau lebih benua (multi-select / derived from API tags) */
  regionIds: string[];
  /** Satu atau lebih negara (multi-select / derived from API tags) */
  countryIds: string[];
  /** Satu atau lebih kota (multi-select / derived from API tags) */
  cityIds: string[];
  /** Kata kunci pencarian (judul, file, nama lokasi) */
  tags: string[];
  /** Nama file dokumen (BE: `nameDocument`) */
  fileName: string;
  status: "draft" | "published";
  /** Present when row was loaded from list API */
  structuredTags?: DocumentGuideStructuredTag[];
  createdAt?: string;
};
