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
  const { t, locale } = useLanding();
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
    <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-32 dark:bg-[#0b1120]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 h-[800px] w-[800px] -translate-y-1/2 translate-x-1/3 rounded-full bg-landing-orange/5 blur-[120px]" />
      </div>
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:gap-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-landing-orange mb-3">
            {locale === "id" ? "Kata Mereka" : "Testimonials"}
          </p>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
            {t.testimonials.title}{" "}
            <span className="bg-gradient-to-r from-landing-orange to-[#ffb347] bg-clip-text text-transparent">{t.testimonials.titleHighlight}</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">{t.testimonials.intro}</p>

          <div className="relative mt-10 rounded-[2.5rem] border border-white/50 bg-white/70 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-landing-orange/20 hover:border-landing-orange/30 sm:mt-12 sm:p-10 dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none">
            <svg className="absolute -top-6 -left-4 h-16 w-16 text-landing-orange/20" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <p className="relative z-10 text-lg italic leading-relaxed text-slate-700 sm:text-xl dark:text-slate-200">
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
          className="hidden min-h-[320px] rounded-3xl bg-gradient-to-br from-landing-peach to-orange-100 lg:flex lg:items-center justify-center dark:from-slate-800 dark:to-slate-900 group"
          aria-hidden
        >
          <div className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-landing-orange/50 bg-white/70 text-3xl font-bold text-landing-orange shadow-xl transition-transform duration-500 group-hover:scale-110 dark:bg-white/10">
            {current.name.slice(0, 1)}
          </div>
        </div>
      </div>
    </section>
  );
}
