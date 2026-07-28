"use client";

import { useEffect, useRef } from "react";
import type { PublicMapPin } from "@/lib/document-guide/parse-map-pins";

const LEAFLET_CSS =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const LEAFLET_JS =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";

type AdventureMapProps = {
  pins: PublicMapPin[];
  daysLabel: string;
  guidesLabel: string;
  viewGuidesLabel: string;
};

/** Minimal Leaflet surface used by this map (CDN-loaded, no npm resolve at build). */
type LeafletNs = {
  map: (
    el: HTMLElement,
    opts?: { scrollWheelZoom?: boolean; worldCopyJump?: boolean },
  ) => LeafletMapInstance;
  tileLayer: (
    url: string,
    opts?: Record<string, unknown>,
  ) => { addTo: (map: LeafletMapInstance) => unknown };
  marker: (latlng: [number, number]) => LeafletMarker;
  Icon: {
    Default: {
      prototype: Record<string, unknown>;
      mergeOptions: (opts: Record<string, string>) => void;
    };
  };
};

type LeafletMapInstance = {
  setView: (latlng: [number, number], zoom: number) => LeafletMapInstance;
  fitBounds: (
    bounds: [number, number][],
    opts?: { padding?: [number, number]; maxZoom?: number },
  ) => void;
  invalidateSize: () => void;
  remove: () => void;
};

type LeafletMarker = {
  addTo: (map: LeafletMapInstance) => LeafletMarker;
  bindPopup: (
    html: string,
    opts?: { maxWidth?: number; className?: string },
  ) => LeafletMarker;
  remove: () => void;
};

declare global {
  interface Window {
    L?: LeafletNs;
  }
}

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
      return `<li class="ez-map-item">
        <a class="ez-map-item-title" href="${href}">${escapeHtml(g.title)}</a>
        ${days}
      </li>`;
    })
    .join("");

  const more =
    pin.guideCount > pin.guides.length
      ? `<p class="ez-map-more">+${pin.guideCount - pin.guides.length}</p>`
      : "";

  const catalogHref = `/guide-document?search=${encodeURIComponent(pin.label)}`;

  return `
    <div class="ez-map-popup">
      <div class="ez-map-head">
        <p class="ez-map-title">${escapeHtml(pin.label)}</p>
        <p class="ez-map-count">${pin.guideCount} ${escapeHtml(guidesLabel)}</p>
      </div>
      <ul class="ez-map-list">${guidesHtml}</ul>
      ${more}
      <div class="ez-map-foot">
        <a class="ez-map-cta" href="${catalogHref}">${escapeHtml(viewGuidesLabel)}</a>
      </div>
    </div>
  `;
}

function ensureLeafletCss(): void {
  if (document.querySelector(`link[href="${LEAFLET_CSS}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = LEAFLET_CSS;
  document.head.appendChild(link);
}

function loadLeafletScript(): Promise<LeafletNs> {
  if (window.L) return Promise.resolve(window.L);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${LEAFLET_JS}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.L) resolve(window.L);
        else reject(new Error("Leaflet failed to load"));
      });
      existing.addEventListener("error", () =>
        reject(new Error("Leaflet script error")),
      );
      if (window.L) resolve(window.L);
      return;
    }

    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => {
      if (window.L) resolve(window.L);
      else reject(new Error("Leaflet failed to load"));
    };
    script.onerror = () => reject(new Error("Leaflet script error"));
    document.head.appendChild(script);
  });
}

export function AdventureMap({
  pins,
  daysLabel,
  guidesLabel,
  viewGuidesLabel,
}: AdventureMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof window === "undefined") return;

    let cancelled = false;

    void (async () => {
      try {
        ensureLeafletCss();
        const L = await loadLeafletScript();
        if (cancelled || !hostRef.current) return;

        delete L.Icon.Default.prototype._getIconUrl;
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
            { maxWidth: 300, className: "ez-map-popup-wrap" },
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
      } catch {
        // Map stays empty; section already has empty/error states upstream.
      }
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
