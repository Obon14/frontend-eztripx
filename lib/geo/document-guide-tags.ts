import {
  resolveTripleFromCityId,
  resolveTripleFromCountryId,
} from "@/lib/geo/document-guide-resolve";

export type DocumentGuideTagEntry = {
  regionId: number;
  countryId: number | null;
  cityId: number | null;
};

function tagKey(r: number, c: number | null, ct: number | null) {
  return `${r}-${c ?? "∅"}-${ct ?? "∅"}`;
}

/**
 * Build BE `tags` array from independent multi-selects.
 * - Each city → full triple (countryId & cityId set).
 * - Each country → { regionId, countryId, cityId: null } only if no selected city already uses that countryId
 *   (avoids duplicate rows when UI auto-fills country from city).
 * - Each region-only selection → { regionId, countryId: null, cityId: null } if not already covered.
 */
export async function buildDocumentGuideTags(
  regionIds: string[],
  countryIds: string[],
  cityIds: string[],
): Promise<DocumentGuideTagEntry[]> {
  const out: DocumentGuideTagEntry[] = [];
  const seen = new Set<string>();
  const countryIdsFromCities = new Set<number>();

  function push(r: number, c: number | null, ct: number | null) {
    const k = tagKey(r, c, ct);
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ regionId: r, countryId: c, cityId: ct });
  }

  for (const cid of cityIds) {
    const t = await resolveTripleFromCityId(cid);
    if (!t) continue;
    countryIdsFromCities.add(t.countryId);
    push(t.regionId, t.countryId, t.cityId);
  }

  for (const coid of countryIds) {
    const cNum = Number(coid);
    if (Number.isFinite(cNum) && countryIdsFromCities.has(cNum)) continue;
    const p = await resolveTripleFromCountryId(coid);
    if (!p) continue;
    push(p.regionId, p.countryId, null);
  }

  for (const rid of regionIds) {
    const rNum = Number(rid);
    if (!Number.isFinite(rNum)) continue;
    const covered = out.some((t) => t.regionId === rNum);
    if (!covered) {
      push(rNum, null, null);
    }
  }

  return out;
}
