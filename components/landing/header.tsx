"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLanding } from "@/components/landing/language-provider";
import { AccountMenu } from "@/components/landing/account-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { Locale } from "@/lib/i18n/landing";

const navIds = [
  { id: "discover", href: "/#discover" },
  { id: "services", href: "/#services" },
  { id: "guideDocument", href: "/guide-document" },
  { id: "community", href: "/#community" },
  { id: "about", href: "/#about" },
] as const;

export function LandingHeader() {
  const {
    t,
    locale,
    setLocale,
    openLogin,
    openRegister,
    currentUser,
    isCheckingAuth,
  } = useLanding();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);

  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLabels = {
    discover: t.nav.discover,
    services: t.nav.services,
    guideDocument: t.nav.guideDocument,
    community: t.nav.community,
    about: t.nav.about,
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-landing-forest/90 shadow-sm shadow-black/10 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-3.5 lg:px-8">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-0.5 text-lg font-extrabold tracking-tight text-white sm:text-xl"
          >
            <Image
              src="/images/logo-eztripx.png"
              alt="EzTripx"
              width={40}
              height={40}
              unoptimized
              className="h-8 w-8 shrink-0 bg-transparent object-contain sm:h-10 sm:w-10"
              priority
            />
            <span className="truncate">
              <span className="text-landing-orange">Ez</span>Tripx
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex lg:gap-8">
            {navIds.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="whitespace-nowrap text-sm font-medium text-white/85 transition hover:text-landing-orange"
              >
                {navLabels[item.id]}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <div className="hidden sm:block">
              <LanguageToggle locale={locale} onChange={setLocale} />
            </div>

            {!isCheckingAuth && currentUser ? (
              <AccountMenu />
            ) : (
              <>
                <button
                  type="button"
                  onClick={openLogin}
                  className="hidden text-sm font-medium text-white/90 transition hover:text-landing-orange sm:inline-flex"
                >
                  {t.nav.login}
                </button>
                <button
                  type="button"
                  onClick={openRegister}
                  className="hidden rounded-lg bg-landing-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-admin-primary-600 sm:inline-flex"
                >
                  {t.nav.register}
                </button>
              </>
            )}

            <ThemeToggle tone="onDark" className="hidden sm:inline-flex" />

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t.nav.openMenu}
              aria-expanded={menuOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white/90 transition hover:border-landing-orange hover:text-landing-orange lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* Kept outside <header>: its backdrop-blur would make the header a
          containing block for fixed-position descendants. */}
      {menuOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label={t.nav.closeMenu}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full bg-slate-950/60"
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(20rem,86vw)] flex-col overflow-y-auto overscroll-contain border-l border-white/10 bg-landing-forest shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-base font-extrabold tracking-tight text-white">
                <span className="text-landing-orange">Ez</span>Tripx
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t.nav.closeMenu}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white/90 transition hover:border-landing-orange hover:text-landing-orange"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <nav className="flex flex-col gap-1 px-3 py-4">
              {navIds.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-landing-orange"
                >
                  {navLabels[item.id]}
                </Link>
              ))}
            </nav>

            <div className="mt-auto">
              {!isCheckingAuth && !currentUser ? (
                <div className="flex flex-col gap-2 border-t border-white/10 px-4 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      openLogin();
                    }}
                    className="h-11 rounded-lg border border-white/20 text-sm font-semibold text-white/90 transition hover:border-landing-orange hover:text-landing-orange"
                  >
                    {t.nav.login}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      openRegister();
                    }}
                    className="h-11 rounded-lg bg-landing-orange text-sm font-semibold text-white transition hover:bg-admin-primary-600"
                  >
                    {t.nav.register}
                  </button>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-4">
                <LanguageToggle locale={locale} onChange={setLocale} />
                <ThemeToggle tone="onDark" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
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
