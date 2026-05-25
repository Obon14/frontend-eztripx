"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type LandingSearchFilters = {
  regionIds: number[];
  countryIds: number[];
  cityIds: number[];
  tripDays: number | null;
};

type LandingSearchContextValue = {
  filters: LandingSearchFilters;
  setFilters: (next: Partial<LandingSearchFilters>) => void;
  applySearch: (next: Partial<LandingSearchFilters>) => void;
  searchVersion: number;
};

const defaultFilters: LandingSearchFilters = {
  regionIds: [],
  countryIds: [],
  cityIds: [],
  tripDays: null,
};

const LandingSearchContext = createContext<LandingSearchContextValue | null>(
  null,
);

export function LandingSearchProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] =
    useState<LandingSearchFilters>(defaultFilters);
  const [searchVersion, setSearchVersion] = useState(0);

  const setFilters = useCallback((next: Partial<LandingSearchFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...next }));
  }, []);

  const applySearch = useCallback((next: Partial<LandingSearchFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...next }));
    setSearchVersion((v) => v + 1);
  }, []);

  const value = useMemo(
    () => ({ filters, setFilters, applySearch, searchVersion }),
    [filters, setFilters, applySearch, searchVersion],
  );

  return (
    <LandingSearchContext.Provider value={value}>
      {children}
    </LandingSearchContext.Provider>
  );
}

export function useLandingSearch(): LandingSearchContextValue {
  const ctx = useContext(LandingSearchContext);
  if (!ctx) {
    throw new Error("useLandingSearch must be used within LandingSearchProvider");
  }
  return ctx;
}
