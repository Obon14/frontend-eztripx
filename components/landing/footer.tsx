"use client";

import { useLanding } from "@/components/landing/language-provider";

export function LandingFooter() {
  const { t } = useLanding();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xl font-extrabold text-slate-900">
            <span className="text-landing-orange">Ez</span>Tripx
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.footer.tagline}</p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500 sm:flex-row">
          <p>{t.footer.copyright}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-landing-orange">
              {t.footer.terms}
            </a>
            <a href="#" className="hover:text-landing-orange">
              {t.footer.privacy}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
