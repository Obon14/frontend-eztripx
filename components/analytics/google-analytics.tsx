"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
const isValidGaId = /^G-[A-Z0-9]+$/.test(GA_ID);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const skipInitialConfig = useRef(true);
  const enabled = isValidGaId && !pathname.startsWith("/admin");

  useEffect(() => {
    if (!enabled) return;
    if (skipInitialConfig.current) {
      skipInitialConfig.current = false;
      return;
    }
    window.gtag?.("config", GA_ID, { page_path: pathname });
  }, [enabled, pathname]);

  if (!enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
