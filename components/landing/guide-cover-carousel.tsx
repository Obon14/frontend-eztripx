"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  publicGuideCoverSrc,
  type PublicCoverImage,
} from "@/lib/document-guide/parse-public-list";

const DEFAULT_COVER = "/images/default-guide-cover.svg";

export function GuideCoverCarousel({
  guideId,
  coverImages,
  alt,
}: {
  guideId: string;
  coverImages: PublicCoverImage[];
  alt: string;
}) {
  const images =
    coverImages.length > 0
      ? coverImages
      : [{ id: "default", url: "", sortOrder: 0 }];
  const [idx, setIdx] = useState(0);
  const current = images[idx] ?? images[0];
  const src =
    current.id === "default"
      ? DEFAULT_COVER
      : publicGuideCoverSrc(guideId, current.id);

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={(e) => {
          const img = e.currentTarget;
          if (img.src !== DEFAULT_COVER) {
            img.src = DEFAULT_COVER;
          }
        }}
      />
      {images.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => setIdx((i) => (i + 1) % images.length)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                aria-label={`Image ${i + 1}`}
                onClick={() => setIdx(i)}
                className={`h-1.5 w-1.5 rounded-full transition ${
                  i === idx ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
