"use client";

import { useLanding } from "@/components/landing/language-provider";
import { footerLinks } from "@/lib/mock/landing-data";

export function LandingFooter() {
  const { t } = useLanding();

  const columns = [
    { title: t.footer.about, links: footerLinks.about },
    { title: t.footer.movement, links: footerLinks.movement },
    { title: t.footer.company, links: footerLinks.company },
    { title: t.footer.support, links: footerLinks.support },
  ];

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <p className="text-xl font-extrabold text-slate-900">
              <span className="text-landing-orange">Ez</span>Tripx
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.footer.tagline}</p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-600 transition hover:text-landing-orange"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
