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
    <section id="about" className="relative bg-white py-20 sm:py-32 dark:bg-[#0b1120] overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2240%22 height%3D%2240%22 viewBox%3D%220 0 40 40%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath d%3D%22M20 20.5V18H0v-2h20v-2.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5v2.5h20v2H21v2.5a.5.5 0 0 1-.5.5h-.5a.5.5 0 0 1-.5-.5z%22 fill%3D%22%23f28538%22 fill-opacity%3D%220.03%22 fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] opacity-100" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:gap-16 sm:px-6 lg:grid-cols-2 lg:gap-24 lg:px-8">
        <div
          className="relative min-h-[220px] overflow-hidden rounded-3xl bg-gradient-to-br from-landing-forest via-landing-forest-light to-[#2d4a34] shadow-xl shadow-landing-forest/20 sm:min-h-[300px] lg:min-h-[360px]"
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
          <div className="relative flex h-full min-h-[220px] items-center justify-center p-8 sm:min-h-[300px] sm:p-10 lg:min-h-[360px]">
            <div className="relative">
              <div className="h-32 w-32 rounded-full border-2 border-landing-orange/40 bg-landing-orange/5 backdrop-blur-sm sm:h-44 sm:w-44" />
              <div className="absolute inset-4 rounded-full border border-white/20" />
              <div className="absolute -right-2 -top-2 h-16 w-16 rounded-2xl bg-landing-orange/90 shadow-lg" />
              <div className="absolute -bottom-3 -left-3 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md" />
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-landing-orange">
            EzTripx
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
            {t.stories.title}{" "}
            <span className="bg-gradient-to-r from-landing-orange to-[#ffb347] bg-clip-text text-transparent">{t.stories.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:mt-5 sm:text-base dark:text-slate-300">{t.stories.p1}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:mt-4 sm:text-base dark:text-slate-300">{t.stories.p2}</p>

          <div className="mt-10 grid grid-cols-3 gap-4 sm:mt-14 sm:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group rounded-[2rem] border border-slate-100 bg-white p-4 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-2 hover:scale-[1.05] hover:border-landing-orange/30 hover:shadow-[0_20px_40px_rgb(242,133,56,0.15)] sm:p-6 dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-none backdrop-blur-md"
              >
                <p className="text-2xl font-black text-landing-orange transition-transform duration-500 group-hover:scale-110 sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[0.65rem] font-semibold uppercase leading-tight tracking-wide text-slate-500 sm:text-xs dark:text-slate-400">
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
