"use client";

import { useLanding } from "@/components/landing/language-provider";

export function CtaSection() {
  const { t, openRegister } = useLanding();

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-landing-peach px-6 py-14 text-center sm:px-12 dark:ring-1 dark:ring-white/5">
        <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-slate-100">
          {t.cta.title}{" "}
          <span className="text-landing-orange">{t.cta.titleHighlight}</span>
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-slate-600 dark:text-slate-300">{t.cta.subtitle}</p>
        <button
          type="button"
          onClick={openRegister}
          className="mt-8 rounded-xl bg-landing-orange px-8 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-admin-primary-600"
        >
          {t.cta.button}
        </button>
      </div>
    </section>
  );
}
