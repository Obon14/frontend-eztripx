"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { PublicMapPin } from "@/lib/document-guide/parse-map-pins";

type AdventureMapProps = {
  pins: PublicMapPin[];
  daysLabel: string;
  guidesLabel: string;
  viewGuidesLabel: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPopupHtml(
  pin: PublicMapPin,
  daysLabel: string,
  guidesLabel: string,
  viewGuidesLabel: string,
): string {
  const guidesHtml = pin.guides
    .slice(0, 3)
    .map((g) => {
      const days =
        g.tripDays && g.tripDays > 0
          ? `<span class="ez-map-days">${g.tripDays} ${escapeHtml(daysLabel)}</span>`
          : "";
      const href = `/guide-document?search=${encodeURIComponent(g.title)}`;
      return `<li><a href="${href}">${escapeHtml(g.title)}</a>${days}</li>`;
    })
    .join("");

  const more =
    pin.guideCount > pin.guides.length
      ? `<p class="ez-map-more">+${pin.guideCount - pin.guides.length}</p>`
      : "";

  const catalogHref = `/guide-document?search=${encodeURIComponent(pin.label)}`;

  return `
    <div class="ez-map-popup">
      <p class="ez-map-title">${escapeHtml(pin.label)}</p>
      <p class="ez-map-count">${pin.guideCount} ${escapeHtml(guidesLabel)}</p>
      <ul class="ez-map-list">${guidesHtml}</ul>
      ${more}
      <a class="ez-map-cta" href="${catalogHref}">${escapeHtml(viewGuidesLabel)}</a>
    </div>
  `;
}

export function AdventureMap({
  pins,
  daysLabel,
  guidesLabel,
  viewGuidesLabel,
}: AdventureMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof window === "undefined") return;

    let cancelled = false;

    void (async () => {
      const leafletMod = await import("leaflet");
      const L = (leafletMod.default ?? leafletMod) as typeof import("leaflet");

      if (cancelled || !hostRef.current) return;

      // Fix default marker icons under bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(host, {
        scrollWheelZoom: false,
        worldCopyJump: true,
      }).setView([20, 10], 2);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;

      for (const m of markersRef.current) {
        m.remove();
      }
      markersRef.current = [];

      const bounds: [number, number][] = [];
      for (const pin of pins) {
        const marker = L.marker([pin.lat, pin.lng]).addTo(map);
        marker.bindPopup(
          buildPopupHtml(pin, daysLabel, guidesLabel, viewGuidesLabel),
          { maxWidth: 280, className: "ez-map-popup-wrap" },
        );
        markersRef.current.push(marker);
        bounds.push([pin.lat, pin.lng]);
      }

      if (bounds.length === 1) {
        map.setView(bounds[0], 5);
      } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
      }

      window.setTimeout(() => {
        map.invalidateSize();
      }, 80);
    })();

    return () => {
      cancelled = true;
      for (const m of markersRef.current) {
        m.remove();
      }
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pins, daysLabel, guidesLabel, viewGuidesLabel]);

  return <div ref={hostRef} className="h-full w-full" />;
}
