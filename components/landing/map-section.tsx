"use client";

import { useLanding } from "@/components/landing/language-provider";
import { mapPins } from "@/lib/mock/landing-data";

export function MapSection() {
  const { t } = useLanding();

  return (
    <section id="community" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {t.map.title}{" "}
          <span className="text-landing-orange">{t.map.titleHighlight}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">{t.map.subtitle}</p>

        <div className="relative mx-auto mt-12 aspect-[2/1] max-w-4xl overflow-hidden rounded-3xl border border-slate-100 bg-slate-50">
          <svg
            viewBox="0 0 800 400"
            className="h-full w-full text-slate-300"
            aria-hidden
          >
            {Array.from({ length: 120 }).map((_, i) => {
              const x = (i % 20) * 40 + 20;
              const y = Math.floor(i / 20) * 36 + 20;
              return <circle key={i} cx={x} cy={y} r="2" fill="currentColor" opacity={0.5} />;
            })}
          </svg>

          {mapPins.map((pin) => (
            <span
              key={pin.id}
              title={pin.label}
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-landing-orange ring-4 ring-landing-orange/25"
              style={{ top: pin.top, left: pin.left }}
            />
          ))}

          <div
            className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg"
          >
            <p className="text-sm font-bold text-slate-900">{t.map.featured}</p>
            <div className="mt-2 flex -space-x-2">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-landing-forest text-[10px] font-bold text-white"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
