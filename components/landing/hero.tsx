"use client";

import { Calendar, MapPin, Search } from "lucide-react";
import { useState } from "react";
import {
  HeroLocationPicker,
  type LocationSelection,
} from "@/components/landing/hero-location-picker";
import { useLandingSearch } from "@/components/landing/landing-search-provider";
import { useLanding } from "@/components/landing/language-provider";

export function HeroSection() {
  const { t } = useLanding();
  const { filters, setFilters, applySearch } = useLandingSearch();

  const [location, setLocation] = useState<LocationSelection>({
    regions: [],
    countries: [],
    cities: [],
  });
  const [tripDays, setTripDays] = useState<string>(
    filters.tripDays != null ? String(filters.tripDays) : "",
  );

  function handleLocationChange(next: LocationSelection) {
    setLocation(next);
    setFilters({
      regionIds: next.regions.map((r) => Number(r.id)).filter(Number.isFinite),
      countryIds: next.countries.map((c) => Number(c.id)).filter(Number.isFinite),
      cityIds: next.cities.map((c) => Number(c.id)).filter(Number.isFinite),
    });
  }

  function handleSearch() {
    applySearch({
      regionIds: location.regions.map((r) => Number(r.id)).filter(Number.isFinite),
      countryIds: location.countries.map((c) => Number(c.id)).filter(Number.isFinite),
      cityIds: location.cities.map((c) => Number(c.id)).filter(Number.isFinite),
      tripDays: tripDays ? Number(tripDays) : null,
    });
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      id="discover"
      className="relative overflow-x-hidden bg-landing-forest pb-20 pt-12 sm:pb-24 sm:pt-16"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 20%, rgba(242,133,56,0.22) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 85% 80%, rgba(34,197,94,0.12) 0%, transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-landing-orange/8 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center lg:max-w-4xl">
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            {t.hero.titleLine1}{" "}
            <span className="bg-gradient-to-r from-landing-orange to-[#ffb347] bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            {t.hero.subtitle}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <div className="rounded-2xl bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
            <div className="flex flex-col lg:flex-row lg:items-stretch">
              <div className="min-w-0 flex-1 border-b border-slate-100 p-4 sm:p-5 lg:border-b-0 lg:border-r">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-landing-orange/10">
                    <MapPin className="h-3.5 w-3.5 text-landing-orange" aria-hidden />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.hero.location}
                  </span>
                </div>
                <HeroLocationPicker
                  value={location}
                  onChange={handleLocationChange}
                />
              </div>

              <div className="flex border-b border-slate-100 lg:w-36 lg:flex-col lg:border-b-0 lg:border-r xl:w-40">
                <div className="flex flex-1 flex-col justify-center px-4 py-4 sm:px-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-landing-orange/10">
                      <Calendar className="h-3.5 w-3.5 text-landing-orange" aria-hidden />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {t.hero.duration}
                    </span>
                  </div>
                  <input
                    id="hero-trip-days"
                    type="number"
                    min={1}
                    max={365}
                    placeholder={t.hero.durationPlaceholder}
                    value={tripDays}
                    onChange={(e) => setTripDays(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-landing-orange focus:bg-white focus:ring-2 focus:ring-landing-orange/15"
                  />
                </div>
              </div>

              <div className="p-3 lg:flex lg:items-stretch lg:p-0">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-landing-orange text-sm font-bold text-white shadow-md shadow-landing-orange/25 transition hover:bg-[#e07830] lg:h-full lg:min-w-[7rem] lg:rounded-none lg:rounded-r-2xl lg:px-6"
                >
                  <Search className="h-4 w-4" strokeWidth={2.5} />
                  {t.hero.search}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
