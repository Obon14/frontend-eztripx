"use client";

import { Check, ChevronDown, MapPin, Search, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useLanding } from "@/components/landing/language-provider";
import {
  loadPublicCityOptionsPage,
  loadPublicCountryOptionsPage,
  loadPublicRegionOptionsPage,
} from "@/lib/geo/public-select-options";
import type { SearchableSelectOption } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";

export type LocationSelection = {
  regions: SearchableSelectOption[];
  countries: SearchableSelectOption[];
  cities: SearchableSelectOption[];
};

type HeroLocationPickerProps = {
  value: LocationSelection;
  onChange: (next: LocationSelection) => void;
};

type PanelRect = { top: number; left: number; width: number };

function usePanelPosition(
  anchorRef: RefObject<HTMLElement | null>,
  open: boolean,
): PanelRect | null {
  const [pos, setPos] = useState<PanelRect | null>(null);

  const update = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 8;
    const width = Math.min(rect.width, window.innerWidth - pad * 2);
    let left = rect.left;
    if (left + width > window.innerWidth - pad) {
      left = window.innerWidth - pad - width;
    }
    setPos({
      top: rect.bottom + 8,
      left: Math.max(pad, left),
      width,
    });
  }, [anchorRef]);

  useEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, update]);

  return pos;
}

function toggleInList(
  list: SearchableSelectOption[],
  opt: SearchableSelectOption,
): SearchableSelectOption[] {
  const exists = list.some((x) => x.id === opt.id);
  if (exists) return list.filter((x) => x.id !== opt.id);
  return [...list, opt];
}

function MultiOptionList({
  options,
  loading,
  selectedIds,
  emptyHint,
  onToggle,
}: {
  options: SearchableSelectOption[];
  loading: boolean;
  selectedIds: Set<string>;
  emptyHint: string;
  onToggle: (opt: SearchableSelectOption) => void;
}) {
  if (loading) {
    return <p className="px-3 py-6 text-center text-sm text-slate-500">…</p>;
  }
  if (options.length === 0) {
    return <p className="px-3 py-6 text-center text-sm text-slate-500">{emptyHint}</p>;
  }
  return (
    <ul className="py-1">
      {options.map((opt) => {
        const selected = selectedIds.has(opt.id);
        return (
          <li key={opt.id}>
            <button
              type="button"
              onClick={() => onToggle(opt)}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition",
                selected
                  ? "bg-landing-orange/10 font-medium text-slate-900"
                  : "text-slate-700 hover:bg-slate-50",
              )}
            >
              <span className="truncate">{opt.label}</span>
              {selected ? (
                <Check className="h-4 w-4 shrink-0 text-landing-orange" />
              ) : (
                <span className="h-4 w-4 shrink-0 rounded border border-slate-300" />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function LocationColumn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden sm:h-[260px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ColumnSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative shrink-0 border-b border-slate-100 px-2 py-2">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-full rounded-md border-0 bg-slate-50 pl-8 pr-2 text-sm text-slate-900 outline-none ring-1 ring-slate-200/80 focus:bg-white focus:ring-landing-orange/30"
      />
    </div>
  );
}

function idsFromOptions(opts: SearchableSelectOption[]): number[] {
  return opts.map((o) => Number(o.id)).filter((n) => Number.isFinite(n));
}

export function HeroLocationPicker({ value, onChange }: HeroLocationPickerProps) {
  const { t, locale } = useLanding();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelPos = usePanelPosition(anchorRef, open);

  const [regionQuery, setRegionQuery] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [regions, setRegions] = useState<SearchableSelectOption[]>([]);
  const [countries, setCountries] = useState<SearchableSelectOption[]>([]);
  const [cities, setCities] = useState<SearchableSelectOption[]>([]);
  const [loadingR, setLoadingR] = useState(false);
  const [loadingC, setLoadingC] = useState(false);
  const [loadingCity, setLoadingCity] = useState(false);

  const regionIdSet = useMemo(
    () => new Set(value.regions.map((r) => r.id)),
    [value.regions],
  );
  const countryIdSet = useMemo(
    () => new Set(value.countries.map((c) => c.id)),
    [value.countries],
  );
  const cityIdSet = useMemo(
    () => new Set(value.cities.map((c) => c.id)),
    [value.cities],
  );

  const regionIdNums = idsFromOptions(value.regions);
  const countryIdNums = idsFromOptions(value.countries);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadRegions = useCallback(async (q: string) => {
    setLoadingR(true);
    try {
      setRegions((await loadPublicRegionOptionsPage(q, 1)).options);
    } finally {
      setLoadingR(false);
    }
  }, []);

  const loadCountries = useCallback(
    async (q: string) => {
      setLoadingC(true);
      try {
        setCountries(
          (await loadPublicCountryOptionsPage(q, 1, regionIdNums)).options,
        );
      } finally {
        setLoadingC(false);
      }
    },
    [regionIdNums.join(",")],
  );

  const loadCities = useCallback(
    async (q: string) => {
      setLoadingCity(true);
      try {
        setCities(
          (await loadPublicCityOptionsPage(q, 1, countryIdNums)).options,
        );
      } finally {
        setLoadingCity(false);
      }
    },
    [countryIdNums.join(",")],
  );

  useEffect(() => {
    if (!open) return;
    void loadRegions(regionQuery);
  }, [open, regionQuery, loadRegions]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => void loadCountries(countryQuery), 200);
    return () => window.clearTimeout(timer);
  }, [open, countryQuery, loadCountries]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => void loadCities(cityQuery), 200);
    return () => window.clearTimeout(timer);
  }, [open, cityQuery, loadCities]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (anchorRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function buildSummary(): string {
    const { regions, countries, cities } = value;
    const total = regions.length + countries.length + cities.length;
    if (total === 0) return t.hero.locationPlaceholder;

    const parts: string[] = [];
    if (cities.length > 0) {
      parts.push(
        cities.length <= 2
          ? cities.map((c) => c.label).join(", ")
          : t.hero.locationCount.replace("{n}", String(cities.length)).replace(
              "{what}",
              locale === "id" ? "kota" : "cities",
            ),
      );
    }
    if (countries.length > 0) {
      parts.push(
        countries.length <= 2
          ? countries.map((c) => c.label).join(", ")
          : t.hero.locationCount.replace("{n}", String(countries.length)).replace(
              "{what}",
              locale === "id" ? "negara" : "countries",
            ),
      );
    }
    if (regions.length > 0) {
      parts.push(
        regions.length <= 2
          ? regions.map((r) => r.label).join(", ")
          : t.hero.locationCount.replace("{n}", String(regions.length)).replace(
              "{what}",
              locale === "id" ? "wilayah" : "regions",
            ),
      );
    }

    return parts.slice(0, 3).join(" · ");
  }

  function clearAll() {
    onChange({ regions: [], countries: [], cities: [] });
    setRegionQuery("");
    setCountryQuery("");
    setCityQuery("");
  }

  const panel =
    open && panelPos && mounted ? (
      <div
        ref={panelRef}
        className="fixed z-[200] flex max-h-[min(400px,calc(100vh-24px))] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/5"
        style={{
          top: panelPos.top,
          left: panelPos.left,
          width: panelPos.width,
        }}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/90 px-3 py-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {t.hero.location}
            </span>
            <p className="text-[10px] text-slate-400">{t.hero.multiSelectHint}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-200/60"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-slate-100 sm:h-[260px] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <LocationColumn>
            <p className="shrink-0 px-3 pt-2 text-[11px] font-semibold uppercase text-slate-400">
              {t.hero.region}
              {value.regions.length > 0 ? (
                <span className="ml-1 text-landing-orange">({value.regions.length})</span>
              ) : null}
            </p>
            <ColumnSearch
              value={regionQuery}
              onChange={setRegionQuery}
              placeholder={t.hero.allRegions}
            />
            <div className="max-h-[200px] min-h-0 flex-1 overflow-y-auto overscroll-y-contain sm:max-h-none [-webkit-overflow-scrolling:touch]">
              <MultiOptionList
                options={regions}
                loading={loadingR}
                selectedIds={regionIdSet}
                emptyHint={t.hero.allRegions}
                onToggle={(opt) => {
                  onChange({
                    ...value,
                    regions: toggleInList(value.regions, opt),
                  });
                }}
              />
            </div>
          </LocationColumn>

          <LocationColumn>
            <p className="shrink-0 px-3 pt-2 text-[11px] font-semibold uppercase text-slate-400">
              {t.hero.country}
              {value.countries.length > 0 ? (
                <span className="ml-1 text-landing-orange">
                  ({value.countries.length})
                </span>
              ) : null}
            </p>
            <ColumnSearch
              value={countryQuery}
              onChange={setCountryQuery}
              placeholder={t.hero.allCountries}
            />
            <div className="max-h-[200px] min-h-0 flex-1 overflow-y-auto overscroll-y-contain sm:max-h-none [-webkit-overflow-scrolling:touch]">
              <MultiOptionList
                options={countries}
                loading={loadingC}
                selectedIds={countryIdSet}
                emptyHint={t.hero.allCountries}
                onToggle={(opt) => {
                  onChange({
                    ...value,
                    countries: toggleInList(value.countries, opt),
                  });
                }}
              />
            </div>
          </LocationColumn>

          <LocationColumn>
            <p className="shrink-0 px-3 pt-2 text-[11px] font-semibold uppercase text-slate-400">
              {t.hero.city}
              {value.cities.length > 0 ? (
                <span className="ml-1 text-landing-orange">({value.cities.length})</span>
              ) : null}
            </p>
            <ColumnSearch
              value={cityQuery}
              onChange={setCityQuery}
              placeholder={t.hero.allCities}
            />
            <div className="max-h-[200px] min-h-0 flex-1 overflow-y-auto overscroll-y-contain sm:max-h-none [-webkit-overflow-scrolling:touch]">
              <MultiOptionList
                options={cities}
                loading={loadingCity}
                selectedIds={cityIdSet}
                emptyHint={t.hero.allCities}
                onToggle={(opt) => {
                  onChange({
                    ...value,
                    cities: toggleInList(value.cities, opt),
                  });
                }}
              />
            </div>
          </LocationColumn>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-3 py-2">
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-slate-500 hover:text-landing-orange"
          >
            {t.hero.clearLocation}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg bg-landing-orange px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#e07830]"
          >
            {t.hero.locationDone}
          </button>
        </div>
      </div>
    ) : null;

  const hasSelection =
    value.regions.length > 0 ||
    value.countries.length > 0 ||
    value.cities.length > 0;

  return (
    <div ref={anchorRef} className="min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-xl border bg-slate-50/80 px-3 text-left transition",
          open
            ? "border-landing-orange bg-white ring-2 ring-landing-orange/15"
            : "border-slate-200/90 hover:border-slate-300 hover:bg-white",
        )}
      >
        <MapPin className="h-4 w-4 shrink-0 text-landing-orange" />
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-sm",
            hasSelection ? "font-semibold text-slate-900" : "text-slate-500",
          )}
        >
          {buildSummary()}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition",
            open && "rotate-180",
          )}
        />
      </button>
      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
