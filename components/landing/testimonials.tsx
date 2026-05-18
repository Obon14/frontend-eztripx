"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useLanding } from "@/components/landing/language-provider";

export function TestimonialsSection() {
  const { t } = useLanding();

  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {t.testimonials.title}{" "}
            <span className="text-landing-orange">{t.testimonials.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-slate-600">{t.testimonials.intro}</p>

          <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-slate-700 leading-relaxed">&ldquo;{t.testimonials.quote}&rdquo;</p>
            <div className="mt-4 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-landing-orange text-landing-orange" />
              ))}
            </div>
            <p className="mt-4 font-bold text-slate-900">Alice Agusta</p>
            <p className="text-sm text-slate-500">{t.testimonials.role}</p>
            <div className="mt-4 flex gap-2">
              <NavDot active />
              <NavDot />
              <NavDot />
              <button
                type="button"
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          className="hidden min-h-[320px] rounded-3xl bg-gradient-to-br from-landing-peach to-orange-100 lg:flex lg:items-center lg:justify-center"
          aria-hidden
        >
          <div className="h-36 w-36 rounded-full border-4 border-landing-orange/50 bg-white/60" />
        </div>
      </div>
    </section>
  );
}

function NavDot({ active }: { active?: boolean }) {
  return (
    <span
      className={
        active
          ? "h-2 w-6 rounded-full bg-landing-orange"
          : "h-2 w-2 rounded-full bg-slate-300"
      }
    />
  );
}
