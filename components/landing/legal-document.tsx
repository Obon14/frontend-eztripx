"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanding } from "@/components/landing/language-provider";
import { legalChrome } from "@/lib/i18n/legal";
import { parseLegalMarkdown } from "@/lib/legal/parse-legal-markdown";
import { parsePublicLegal } from "@/lib/legal/parse-legal";
import type { LegalMdBlock, LegalSlug, PublicLegalDocument } from "@/types/legal";

export function LegalDocument({ kind }: { kind: LegalSlug }) {
  const { locale, t } = useLanding();
  const chrome = legalChrome[locale];
  const otherHref = kind === "terms" ? "/privacy" : "/terms";
  const otherLabel = kind === "terms" ? t.footer.privacy : t.footer.terms;
  const [doc, setDoc] = useState<PublicLegalDocument | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/legal/public/${kind}?locale=${locale}`, {
          cache: "no-store",
        });
        const body = await res.json().catch(() => null);
        const parsed = parsePublicLegal(body);
        if (!res.ok || !parsed) {
          if (!cancelled) {
            setDoc(null);
            setError(
              body && typeof body === "object" && "message" in body && typeof body.message === "string"
                ? body.message
                : chrome.loadError,
            );
          }
          return;
        }
        if (!cancelled) setDoc(parsed);
      } catch {
        if (!cancelled) {
          setDoc(null);
          setError(chrome.loadError);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [kind, locale, chrome.loadError]);

  if (loading) {
    return <p className="py-16 text-center text-sm text-slate-500">{chrome.loading}</p>;
  }

  if (error || !doc) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-red-600 dark:text-red-400">
        {error || chrome.loadError}
      </p>
    );
  }

  const updated = formatLegalDate(doc.updatedAt, locale);
  const blocks = parseLegalMarkdown(doc.body);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-widest text-landing-orange">EzTripx</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
        {doc.title} <span className="text-landing-orange">{doc.titleHighlight}</span>
      </h1>
      <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
        {chrome.lastUpdatedPrefix}: {updated}
      </p>
      <p className="mt-5 text-sm leading-relaxed text-slate-600 sm:mt-6 sm:text-base dark:text-slate-300">{doc.intro}</p>

      <div className="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
        {groupSections(blocks).map((section) => (
          <section key={section.heading}>
            <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg dark:text-slate-100">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-3">
              {section.blocks.map((block, index) => (
                <LegalBlockView key={`${section.heading}-${index}`} block={block} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-8 text-sm sm:mt-14 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <Link href="/" className="font-medium text-slate-500 transition hover:text-landing-orange dark:text-slate-400">
          {chrome.homeLabel}
        </Link>
        <p className="text-slate-600 dark:text-slate-300">
          {chrome.alsoRead}{" "}
          <Link href={otherHref} className="font-semibold text-landing-orange hover:underline">
            {otherLabel}
          </Link>
        </p>
      </div>
    </article>
  );
}

function groupSections(blocks: LegalMdBlock[]): Array<{ heading: string; blocks: LegalMdBlock[] }> {
  const sections: Array<{ heading: string; blocks: LegalMdBlock[] }> = [];
  let current: { heading: string; blocks: LegalMdBlock[] } | null = null;

  for (const block of blocks) {
    if (block.type === "h2") {
      current = { heading: block.text, blocks: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { heading: "", blocks: [] };
      sections.push(current);
    }
    current.blocks.push(block);
  }

  return sections.filter((section) => section.heading || section.blocks.length > 0);
}

function formatLegalDate(iso: string, locale: "id" | "en"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function LegalBlockView({ block }: { block: LegalMdBlock }) {
  if (block.type === "h2") {
    return (
      <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg dark:text-slate-100">
        {block.text}
      </h2>
    );
  }
  if (block.type === "ul") {
    return (
      <ul className="list-disc space-y-1.5 break-words pl-5 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return (
    <p className="break-words text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
      {block.text}
    </p>
  );
}
