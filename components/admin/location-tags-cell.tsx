import { MapPin } from "lucide-react";
import type { DocumentGuideStructuredTag } from "@/types/admin";
import { cn } from "@/lib/utils";

const VISIBLE_TAG_COUNT = 2;

const tagChipClass =
  "inline-flex max-w-[148px] items-center gap-1 truncate rounded-md border border-admin-primary/20 bg-admin-primary/5 px-2 py-0.5 text-xs font-medium text-admin-primary-700 dark:border-admin-primary/30 dark:bg-admin-primary/10 dark:text-admin-primary-200";

const overflowChipClass =
  "inline-flex cursor-help items-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300";

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
  const label = formatLocationTagLabel(tag);
  const path = formatLocationTagPath(tag);
  return (
    <span className={tagChipClass} title={path}>
      <MapPin className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
      <span className="truncate">{label}</span>
    </span>
  );
}

function OverflowTagsTooltip({ tags }: { tags: DocumentGuideStructuredTag[] }) {
  return (
    <span className="group relative inline-flex">
      <span
        className={overflowChipClass}
        tabIndex={0}
        aria-label={`${tags.length} lokasi lainnya`}
      >
        +{tags.length}
      </span>
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden w-max max-w-[280px] -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-lg group-hover:block group-focus-within:block dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {tags.map((tag) => (
          <div key={tag.id} className="border-b border-slate-100 py-1.5 last:border-b-0 last:pb-0 first:pt-0 dark:border-slate-800">
            <div className="flex items-center gap-1 font-medium">
              <MapPin className="h-3 w-3 shrink-0 text-admin-primary-600 dark:text-admin-primary-300" aria-hidden />
              {formatLocationTagLabel(tag)}
            </div>
            <div className="mt-0.5 pl-4 text-slate-500 dark:text-slate-400">{formatLocationTagPath(tag)}</div>
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
    <div className="flex max-w-[200px] flex-wrap gap-1.5">
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

export function GuideTitleCell({
  titleId,
  titleEn,
  className,
}: {
  titleId: string;
  titleEn: string | null;
  className?: string;
}) {
  const { primary, secondary } = resolveGuideDisplayTitle(titleId, titleEn);
  return (
    <div className={cn("max-w-[220px]", className)}>
      <div className="line-clamp-2 font-medium leading-snug" title={primary}>
        {primary}
      </div>
      {secondary ? (
        <div className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400" title={secondary}>
          {secondary}
        </div>
      ) : null}
    </div>
  );
}
