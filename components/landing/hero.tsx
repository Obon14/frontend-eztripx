"use client";

import { Calendar, MapPin, Search } from "lucide-react";
import { useLanding } from "@/components/landing/language-provider";

export function HeroSection() {
  const { t } = useLanding();

  return (
    <section
      id="discover"
      className="relative overflow-hidden bg-landing-forest pb-16 pt-10 sm:pb-20 sm:pt-14"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(242,133,56,0.35) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(34,197,94,0.2) 0%, transparent 45%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-landing-orange/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 left-10 h-48 w-48 rounded-full bg-admin-accent/10 blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t.hero.titleLine1}{" "}
            <span className="text-landing-orange">{t.hero.titleHighlight}</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            {t.hero.subtitle}
          </p>
        </div>

        <div className="mt-10 flex max-w-3xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
            <MapPin className="h-5 w-5 shrink-0 text-landing-orange" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">{t.hero.location}</p>
              <p className="truncate text-sm font-semibold text-slate-900">{t.hero.locationValue}</p>
            </div>
          </div>
          <div className="hidden h-10 w-px bg-slate-200 sm:block" />
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 sm:border-0">
            <Calendar className="h-5 w-5 shrink-0 text-landing-orange" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">{t.hero.date}</p>
              <p className="truncate text-sm font-semibold text-slate-900">{t.hero.dateValue}</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-landing-orange px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-admin-primary-600"
          >
            <Search className="h-4 w-4" />
            {t.hero.search}
          </button>
        </div>
      </div>
    </section>
  );
}
