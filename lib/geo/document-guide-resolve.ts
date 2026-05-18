function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  return null;
}

/** BFF may return `{ data: entity }` or the entity object directly. */
function unwrapEntityPayload(body: unknown): Record<string, unknown> | null {
  if (!isRecord(body)) return null;
  if ("data" in body && isRecord(body.data)) return body.data;
  return body;
}

/** Parse GET /country/:id — tolerant of flat regionId */
export function parseCountryDetail(body: unknown): {
  id: number;
  name: string;
  regionId: number;
  regionName: string;
} | null {
  const root = unwrapEntityPayload(body);
  if (!root) return null;
  const id = num(root.id);
  const name = typeof root.name === "string" ? root.name : "";
  if (id == null) return null;

  const region = root.region;
  if (isRecord(region)) {
    const regionId = num(region.id);
    const regionName = typeof region.name === "string" ? region.name : "";
    if (regionId == null) return null;
    return { id, name, regionId, regionName };
  }

  const flatRid = num(root.regionId);
  if (flatRid != null) {
    const regionName = typeof root.regionName === "string" ? root.regionName : "";
    return { id, name, regionId: flatRid, regionName };
  }

  return null;
}

/** Parse GET /city/:id — nested country, flat ids, or country id only */
export function parseCityDetail(body: unknown): {
  cityId: number;
  cityName: string;
  countryId: number;
  countryName: string;
  regionId: number | null;
  regionName: string | null;
} | null {
  const root = unwrapEntityPayload(body);
  if (!root) return null;
  const cityId = num(root.id);
  const cityName = typeof root.name === "string" ? root.name : "";
  if (cityId == null) return null;

  const flatCountryId = num(root.countryId);
  const flatRegionId = num(root.regionId);

  const country = root.country;
  if (isRecord(country)) {
    const countryId = num(country.id);
    const countryName = typeof country.name === "string" ? country.name : "";
    if (countryId == null) return null;

    let regionId: number | null = null;
    let regionName: string | null = null;
    const nestedRegion = country.region;
    if (isRecord(nestedRegion)) {
      regionId = num(nestedRegion.id);
      regionName = typeof nestedRegion.name === "string" ? nestedRegion.name : null;
    }

    if (regionId == null && flatRegionId != null) {
      regionId = flatRegionId;
      regionName = typeof root.regionName === "string" ? root.regionName : null;
    }

    return { cityId, cityName, countryId, countryName, regionId, regionName };
  }

  if (flatCountryId != null) {
    return {
      cityId,
      cityName,
      countryId: flatCountryId,
      countryName: typeof root.countryName === "string" ? root.countryName : "",
      regionId: flatRegionId,
      regionName: typeof root.regionName === "string" ? root.regionName : null,
    };
  }

  return null;
}

export type ResolvedTagTriple = {
  regionId: number;
  countryId: number;
  cityId: number;
  regionLabel: string;
  countryLabel: string;
  cityLabel: string;
};

export async function resolveTripleFromCityId(cityId: string): Promise<ResolvedTagTriple | null> {
  const res = await fetch(`/api/city/${cityId}`, { credentials: "include" });
  if (!res.ok) return null;
  const body: unknown = await res.json().catch(() => null);
  const parsed = parseCityDetail(body);
  if (!parsed) return null;

  let regionId: number | null = parsed.regionId;
  let regionLabel = (parsed.regionName ?? "").trim();
  let countryLabel = (parsed.countryName ?? "").trim();

  if (!countryLabel || regionId == null) {
    const cr = await fetch(`/api/country/${parsed.countryId}`, { credentials: "include" });
    if (!cr.ok) return null;
    const cBody: unknown = await cr.json().catch(() => null);
    const country = parseCountryDetail(cBody);
    if (!country) return null;
    if (!countryLabel) countryLabel = country.name;
    if (regionId == null) {
      regionId = country.regionId;
      regionLabel = country.regionName;
    }
  }

  if (regionId == null) return null;

  return {
    regionId,
    countryId: parsed.countryId,
    cityId: parsed.cityId,
    regionLabel,
    countryLabel,
    cityLabel: parsed.cityName,
  };
}

export async function resolveTripleFromCountryId(countryId: string): Promise<{
  regionId: number;
  countryId: number;
  regionLabel: string;
  countryLabel: string;
} | null> {
  const res = await fetch(`/api/country/${countryId}`, { credentials: "include" });
  if (!res.ok) return null;
  const body: unknown = await res.json().catch(() => null);
  const c = parseCountryDetail(body);
  if (!c) return null;
  return {
    regionId: c.regionId,
    countryId: c.id,
    regionLabel: c.regionName,
    countryLabel: c.name,
  };
}
