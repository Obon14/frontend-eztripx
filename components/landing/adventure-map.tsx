"use client";

import { useEffect, useRef } from "react";
import type { PublicMapPin } from "@/lib/document-guide/parse-map-pins";

const MAPBOX_CSS = "https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css";
const MAPBOX_JS = "https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.js";
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

type AdventureMapProps = {
  pins: PublicMapPin[];
  daysLabel: string;
  guidesLabel: string;
  viewGuidesLabel: string;
};

type MapboxNs = {
  accessToken: string;
  Map: new (opts: Record<string, any>) => any;
  Marker: new (opts?: Record<string, any>) => any;
  Popup: new (opts?: Record<string, any>) => any;
  LngLatBounds: new () => any;
};

declare global {
  interface Window {
    mapboxgl?: MapboxNs;
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

function ensureMapboxCss(): void {
  if (document.querySelector(`link[href="${MAPBOX_CSS}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = MAPBOX_CSS;
  document.head.appendChild(link);
}

function loadMapboxScript(): Promise<MapboxNs> {
  if (window.mapboxgl) return Promise.resolve(window.mapboxgl);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${MAPBOX_JS}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.mapboxgl) resolve(window.mapboxgl);
        else reject(new Error("Mapbox failed to load"));
      });
      existing.addEventListener("error", () =>
        reject(new Error("Mapbox script error")),
      );
      if (window.mapboxgl) resolve(window.mapboxgl);
      return;
    }

    const script = document.createElement("script");
    script.src = MAPBOX_JS;
    script.async = true;
    script.onload = () => {
      if (window.mapboxgl) resolve(window.mapboxgl);
      else reject(new Error("Mapbox failed to load"));
    };
    script.onerror = () => reject(new Error("Mapbox script error"));
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
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof window === "undefined") return;

    let cancelled = false;

    void (async () => {
      try {
        ensureMapboxCss();
        const mapboxgl = await loadMapboxScript();
        if (cancelled || !hostRef.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = new mapboxgl.Map({
          container: host,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [10, 20], // [lng, lat]
          zoom: 2,
          scrollZoom: false,
          dragRotate: false,
        });

        // Add navigation controls (zoom in/out)
        // map.addControl(new mapboxgl.NavigationControl(), "top-right");

        mapRef.current = map;

        for (const m of markersRef.current) {
          m.remove();
        }
        markersRef.current = [];

        const popupMaxWidth = Math.max(180, Math.min(300, host.clientWidth - 48));
        const bounds = new mapboxgl.LngLatBounds();
        let hasPins = false;

        for (const pin of pins) {
          hasPins = true;
          const popup = new mapboxgl.Popup({
            maxWidth: popupMaxWidth + "px",
            className: "ez-map-popup-wrap",
            offset: 25,
          }).setHTML(buildPopupHtml(pin, daysLabel, guidesLabel, viewGuidesLabel));

          const marker = new mapboxgl.Marker({ color: "#f28538" }) // EzTripx orange
            .setLngLat([pin.lng, pin.lat]) // [lng, lat]
            .setPopup(popup)
            .addTo(map);

          markersRef.current.push(marker);
          bounds.extend([pin.lng, pin.lat]);
        }

        // Wait for map to load before fitting bounds
        map.on("load", () => {
          if (cancelled) return;
          if (hasPins && pins.length === 1) {
            map.flyTo({ center: [pins[0].lng, pins[0].lat], zoom: 5 });
          } else if (hasPins && pins.length > 1) {
            map.fitBounds(bounds, { padding: 40, maxZoom: 5, duration: 1000 });
          }
        });

      } catch (err) {
        console.error("Failed to init Mapbox", err);
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
