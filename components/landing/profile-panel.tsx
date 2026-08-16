"use client";

import { useLanding } from "@/components/landing/language-provider";

export function ProfilePanel() {
  const { t, currentUser, isCheckingAuth, openLogin } = useLanding();

  if (isCheckingAuth) {
    return <p className="py-16 text-center text-sm text-slate-500">…</p>;
  }

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-slate-600 dark:text-slate-300">{t.profile.loginRequired}</p>
        <button
          type="button"
          onClick={openLogin}
          className="mt-6 rounded-lg bg-landing-orange px-4 py-2 text-sm font-semibold text-white"
        >
          {t.profile.loginCta}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
        {t.profile.title}
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t.profile.subtitle}</p>
      <dl className="mt-8 space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t.profile.email}
          </dt>
          <dd className="mt-1 break-all text-sm font-medium text-slate-900 dark:text-slate-100">
            {currentUser.email}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t.profile.role}
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
            {currentUser.role}
          </dd>
        </div>
      </dl>
    </div>
  );
}
