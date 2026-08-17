import { Badge } from "@/components/ui/badge";
import type { DocumentGuideStructuredTag } from "@/types/admin";

const VISIBLE_TAG_COUNT = 2;

export function formatLocationTagLabel(tag: DocumentGuideStructuredTag): string {
  const city = tag.city?.name;
  const country = tag.country?.name;
  const region = tag.region?.name;

  if (city && country) return `${city} · ${country}`;
  if (country) return country;
  return region ?? "—";
}

export function formatLocationTagPath(tag: DocumentGuideStructuredTag): string {
  return [tag.region?.name, tag.country?.name, tag.city?.name]
    .filter(Boolean)
    .join(" › ");
}

function LocationTagBadge({ tag }: { tag: DocumentGuideStructuredTag }) {
  const path = formatLocationTagPath(tag);
  return (
    <Badge
      variant="neutral"
      className="max-w-[140px] truncate px-2 py-0.5 text-xs font-normal"
      title={path !== formatLocationTagLabel(tag) ? path : undefined}
    >
      {formatLocationTagLabel(tag)}
    </Badge>
  );
}

function OverflowTagsTooltip({ tags }: { tags: DocumentGuideStructuredTag[] }) {
  return (
    <span className="group relative inline-flex">
      <Badge
        variant="neutral"
        className="cursor-help px-2 py-0.5 text-xs font-normal"
        tabIndex={0}
        aria-label={`${tags.length} lokasi lainnya`}
      >
        +{tags.length}
      </Badge>
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden w-max max-w-[260px] -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 shadow-md group-hover:block group-focus-within:block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {tags.map((tag) => (
          <div key={tag.id} className="py-0.5">
            <div className="font-medium">{formatLocationTagLabel(tag)}</div>
            <div className="text-slate-500 dark:text-slate-400">{formatLocationTagPath(tag)}</div>
          </div>
        ))}
      </div>
    </span>
  );
}

export function LocationTagsCell({ tags }: { tags: DocumentGuideStructuredTag[] }) {
  if (tags.length === 0) {
    return <span className="text-slate-400">—</span>;
  }

  const visible = tags.slice(0, VISIBLE_TAG_COUNT);
  const hidden = tags.slice(VISIBLE_TAG_COUNT);

  return (
    <div className="flex max-w-[220px] flex-wrap gap-1">
      {visible.map((tag) => (
        <LocationTagBadge key={tag.id} tag={tag} />
      ))}
      {hidden.length > 0 ? <OverflowTagsTooltip tags={hidden} /> : null}
    </div>
  );
}

export function resolveGuideDisplayTitle(titleId: string, titleEn: string | null): {
  primary: string;
  secondary: string | null;
} {
  const en = titleEn?.trim();
  const id = titleId.trim() || "—";
  if (en) {
    return { primary: en, secondary: id };
  }
  return { primary: id, secondary: null };
}
