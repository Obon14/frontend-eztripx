"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLanding } from "@/components/landing/language-provider";
import { parsePublicReviewList } from "@/lib/review/parse-review";

type Slide = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
};

export function TestimonialsSection() {
  const { t } = useLanding();
  const [published, setPublished] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/review/public", { cache: "no-store" });
        const body = await res.json().catch(() => null);
        if (!res.ok || cancelled) return;
        const rows = parsePublicReviewList(body).map((row) => ({
          id: row.id,
          name: row.displayName,
          role: row.travelerRole?.trim() || t.testimonials.items[0]?.role || "",
          quote: row.comment,
          rating: row.rating,
        }));
        if (!cancelled) setPublished(rows);
      } catch {
        /* keep dummy */
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [t.testimonials.items]);

  const slides = useMemo<Slide[]>(() => {
    const dummy: Slide[] = t.testimonials.items.map((item, i) => ({
      id: `dummy-${i}`,
      name: item.name,
      role: item.role,
      quote: item.quote,
      rating: 5,
    }));
    return [...dummy, ...published];
  }, [published, t.testimonials.items]);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  const current = slides[index] ?? slides[0];
  const total = slides.length;

  function prev() {
    setIndex((i) => (i - 1 + total) % total);
  }
  function next() {
    setIndex((i) => (i + 1) % total);
  }

  if (!current) return null;

  return (
    <section className="bg-slate-50 py-12 sm:py-20 dark:bg-slate-900">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            {t.testimonials.title}{" "}
            <span className="text-landing-orange">{t.testimonials.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-sm text-slate-600 sm:text-base dark:text-slate-300">{t.testimonials.intro}</p>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:mt-8 sm:p-6 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm leading-relaxed text-slate-700 sm:text-base dark:text-slate-200">
              &ldquo;{current.quote}&rdquo;
            </p>
            <div className="mt-4 flex gap-0.5" aria-label={`${current.rating} / 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < current.rating
                      ? "h-4 w-4 fill-landing-orange text-landing-orange"
                      : "h-4 w-4 text-slate-300 dark:text-slate-600"
                  }
                />
              ))}
            </div>
            <p className="mt-4 font-bold text-slate-900 dark:text-slate-100">{current.name}</p>
            {current.role ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{current.role}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={
                    i === index
                      ? "h-2 w-6 rounded-full bg-landing-orange"
                      : "h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600"
                  }
                />
              ))}
              <button
                type="button"
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-landing-orange hover:text-landing-orange dark:border-slate-700 dark:text-slate-400"
                aria-label={t.testimonials.prev}
                onClick={prev}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-landing-orange hover:text-landing-orange dark:border-slate-700 dark:text-slate-400"
                aria-label={t.testimonials.next}
                onClick={next}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          className="hidden min-h-[320px] rounded-3xl bg-gradient-to-br from-landing-peach to-orange-100 lg:flex lg:items-center justify-center dark:from-slate-800 dark:to-slate-900"
          aria-hidden
        >
          <div className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-landing-orange/50 bg-white/70 text-3xl font-bold text-landing-orange dark:bg-white/10">
            {current.name.slice(0, 1)}
          </div>
        </div>
      </div>
    </section>
  );
}
