"use client";

import { useLanding } from "@/components/landing/language-provider";

export function StoriesSection() {
  const { t } = useLanding();

  const stats = [
    { value: t.stories.stat1Value, label: t.stories.stat1Label },
    { value: t.stories.stat2Value, label: t.stories.stat2Label },
    { value: t.stories.stat3Value, label: t.stories.stat3Label },
  ];

  return (
    <section id="about" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div
          className="hidden min-h-[280px] rounded-3xl bg-gradient-to-br from-landing-forest to-landing-forest-light lg:block"
          aria-hidden
        >
          <div className="flex h-full items-center justify-center p-8">
            <div className="h-40 w-40 rounded-full border-4 border-landing-orange/60 bg-landing-orange/10" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {t.stories.title}{" "}
            <span className="text-landing-orange">{t.stories.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">{t.stories.p1}</p>
          <p className="mt-3 text-slate-600 leading-relaxed">{t.stories.p2}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm"
              >
                <p className="text-2xl font-extrabold text-landing-orange">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
