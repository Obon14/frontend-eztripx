export type LegalSlug = "terms" | "privacy";

export type PublicLegalDocument = {
  slug: LegalSlug;
  title: string;
  titleHighlight: string;
  intro: string;
  body: string;
  updatedAt: string;
};

export type AdminLegalDocument = {
  id: string;
  slug: LegalSlug;
  titleId: string;
  titleEn: string;
  titleHighlightId: string;
  titleHighlightEn: string;
  introId: string;
  introEn: string;
  bodyId: string;
  bodyEn: string;
  updatedAt: string;
};

export type LegalMdBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };
