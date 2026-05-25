"use client";

import { cn } from "@/lib/utils";
import { useLanding } from "@/components/landing/language-provider";
import type { Locale } from "@/lib/i18n/landing";

const navIds = [
  { id: "discover", href: "#discover" },
  { id: "services", href: "#services" },
  { id: "community", href: "#community" },
  { id: "about", href: "#about" },
] as const;

export function LandingHeader() {
  const { t, locale, setLocale, openLogin, openRegister } = useLanding();

  const navLabels = {
    discover: t.nav.discover,
    services: t.nav.services,
    community: t.nav.community,
    about: t.nav.about,
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-landing-forest/90 shadow-sm shadow-black/10 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-1 text-xl font-extrabold tracking-tight text-white">
          <span className="text-landing-orange">Ez</span>Tripx
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navIds.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="text-sm font-medium text-white/85 transition hover:text-landing-orange"
            >
              {navLabels[item.id]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle locale={locale} onChange={setLocale} />
          <button
            type="button"
            onClick={openLogin}
            className="text-sm font-medium text-white/90 transition hover:text-landing-orange"
          >
            {t.nav.login}
          </button>
          <button
            type="button"
            onClick={openRegister}
            className="rounded-lg bg-landing-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-admin-primary-600"
          >
            {t.nav.register}
          </button>
        </div>
      </div>
    </header>
  );
}

function LanguageToggle({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (l: Locale) => void;
}) {
  return (
    <div className="flex rounded-lg border border-white/20 p-0.5 text-xs font-semibold">
      {(["id", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={cn(
            "rounded-md px-2 py-1 uppercase transition",
            locale === code
              ? "bg-landing-orange text-white"
              : "text-white/70 hover:text-white",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
