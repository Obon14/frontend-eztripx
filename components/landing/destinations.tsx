"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState } from "react";
import { useLanding } from "@/components/landing/language-provider";
import { destinations } from "@/lib/mock/landing-data";

export function DestinationsSection() {
  const { t, locale } = useLanding();
  const [index, setIndex] = useState(0);

  const visible = destinations.slice(index, index + 3);
  const canPrev = index > 0;
  const canNext = index + 3 < destinations.length;

  return (
    <section id="services" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {t.destinations.title}{" "}
            <span className="text-landing-orange">{t.destinations.titleHighlight}</span>
          </h2>
          <div className="flex gap-2">
            <CarouselBtn disabled={!canPrev} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </CarouselBtn>
            <CarouselBtn
              disabled={!canNext}
              onClick={() => setIndex((i) => Math.min(destinations.length - 3, i + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </CarouselBtn>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title[locale]}
                  className="h-full w-full object-cover"
                />
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-landing-orange px-2.5 py-1 text-xs font-bold text-white">
                  <Star className="h-3 w-3 fill-white" />
                  {item.rating}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900">{item.title[locale]}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.location[locale]}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-lg font-bold text-landing-orange">
                    ${item.price}
                    <span className="text-sm font-medium text-slate-500">
                      {t.destinations.perPerson}
                    </span>
                  </p>
                  <button
                    type="button"
                    className="rounded-lg border-2 border-landing-orange px-4 py-1.5 text-sm font-semibold text-landing-orange transition hover:bg-landing-orange hover:text-white"
                  >
                    {t.destinations.book}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CarouselBtn({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-landing-orange hover:text-landing-orange disabled:opacity-30"
    >
      {children}
    </button>
  );
}
