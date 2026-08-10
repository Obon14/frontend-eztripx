"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useLanding } from "@/components/landing/language-provider";
import {
  parsePublicMapPinsResponse,
  type PublicMapPin,
} from "@/lib/document-guide/parse-map-pins";

const AdventureMap = dynamic(
  () =>
    import("@/components/landing/adventure-map").then((m) => m.AdventureMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        …
      </div>
    ),
  },
);

export function MapSection() {
  const { t, locale } = useLanding();
  const [pins, setPins] = useState<PublicMapPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `/api/document-guide/public/map-pins?locale=${locale}`,
          { cache: "no-store" },
        );
        const body = await res.json().catch(() => null);
        if (!active) return;
        if (!res.ok) {
          setPins([]);
          setError(true);
          return;
        }
        setPins(parsePublicMapPinsResponse(body));
      } catch {
        if (!active) return;
        setPins([]);
        setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [locale]);

  return (
    <section id="community" className="bg-white py-16 sm:py-20 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
          {t.map.title}{" "}
          <span className="text-landing-orange">{t.map.titleHighlight}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
          {t.map.subtitle}
        </p>

        <div className="relative z-0 isolate mx-auto mt-12 aspect-[2/1] max-w-4xl overflow-hidden rounded-3xl border border-slate-100 bg-slate-900 shadow-lg ring-1 ring-black/5 dark:border-slate-800">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              {t.map.loading}
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center px-6 text-sm text-slate-400">
              {t.map.loadError}
            </div>
          ) : pins.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6">
              <p className="text-sm font-medium text-slate-300">{t.map.empty}</p>
              <p className="text-xs text-slate-500">{t.map.emptyHint}</p>
            </div>
          ) : (
            <AdventureMap
              pins={pins}
              daysLabel={t.destinations.days}
              guidesLabel={t.map.guidesLabel}
              viewGuidesLabel={t.map.viewGuides}
            />
          )}
        </div>
      </div>
    </section>
  );
}
