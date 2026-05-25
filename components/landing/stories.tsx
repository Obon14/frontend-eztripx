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
    <section id="about" className="bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div
          className="relative min-h-[300px] overflow-hidden rounded-3xl bg-gradient-to-br from-landing-forest via-landing-forest-light to-[#2d4a34] shadow-xl shadow-landing-forest/20 lg:min-h-[360px]"
          aria-hidden
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, rgba(242,133,56,0.5) 0%, transparent 50%)",
            }}
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg fill%3D%22none%22 fill-rule%3D%22evenodd%22%3E%3Cg fill%3D%22%23ffffff%22 fill-opacity%3D%220.04%22%3E%3Cpath d%3D%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-60"
          />
          <div className="relative flex h-full min-h-[300px] items-center justify-center p-10 lg:min-h-[360px]">
            <div className="relative">
              <div className="h-44 w-44 rounded-full border-2 border-landing-orange/40 bg-landing-orange/5 backdrop-blur-sm" />
              <div className="absolute inset-4 rounded-full border border-white/20" />
              <div className="absolute -right-2 -top-2 h-16 w-16 rounded-2xl bg-landing-orange/90 shadow-lg" />
              <div className="absolute -bottom-3 -left-3 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md" />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-landing-orange">
            EzTripx
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {t.stories.title}{" "}
            <span className="text-landing-orange">{t.stories.titleHighlight}</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">{t.stories.p1}</p>
          <p className="mt-4 text-base leading-relaxed text-slate-600">{t.stories.p2}</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 text-center transition hover:border-landing-orange/30 hover:bg-white hover:shadow-md"
              >
                <p className="text-2xl font-extrabold text-landing-orange sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
