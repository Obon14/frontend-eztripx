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
      className="relative min-h-[80vh] flex flex-col justify-center overflow-x-hidden bg-landing-forest pb-20 pt-32 sm:pb-32 sm:pt-40 lg:pt-48"
    >
      {/* Subtle premium gradient depth, not neon */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-landing-forest-light/30 to-landing-forest" />
      <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-landing-orange">
            {t.hero.location ? "EzTripx Travel & Itinerary" : "EzTripx Travel & Itinerary"}
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t.hero.titleLine1}{" "}
            <span className="text-landing-orange">
              {t.hero.titleHighlight}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl font-medium">
            {t.hero.subtitle}
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl sm:mt-16">
          <div className="mx-auto max-w-3xl overflow-visible rounded-full bg-white p-2 shadow-2xl ring-1 ring-black/5 dark:bg-slate-900 dark:ring-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center">
              {/* Location Field */}
              <div className="relative flex-1 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className="flex items-center px-6 py-3 lg:py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <MapPin className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="ml-4 flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {t.hero.location}
                    </label>
                    <div className="mt-0.5 w-full">
                      <HeroLocationPicker
                        value={location}
                        onChange={handleLocationChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden h-12 w-px bg-slate-200 lg:block dark:bg-slate-800" />

              {/* Duration Field */}
              <div className="relative flex-1 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className="flex items-center px-6 py-3 lg:py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <Calendar className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="ml-4 flex-1">
                    <label htmlFor="hero-trip-days" className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {t.hero.duration}
                    </label>
                    <input
                      id="hero-trip-days"
                      type="number"
                      min={1}
                      max={365}
                      placeholder={t.hero.durationPlaceholder}
                      value={tripDays}
                      onChange={(e) => setTripDays(e.target.value)}
                      className="mt-0.5 block w-full border-none bg-transparent p-0 text-base font-semibold text-slate-900 placeholder-slate-400 focus:ring-0 dark:text-slate-100 dark:placeholder-slate-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="p-2 lg:p-0 lg:pr-2">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-landing-orange px-8 text-base font-bold text-white transition-all hover:scale-105 hover:bg-[#e07830] hover:shadow-lg hover:shadow-landing-orange/30 active:scale-[0.98] lg:w-auto"
                >
                  <Search className="h-5 w-5" strokeWidth={2.5} />
                  <span className="lg:hidden">{t.hero.search}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
