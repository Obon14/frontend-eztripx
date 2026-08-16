"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useLanding } from "@/components/landing/language-provider";
import { Alert } from "@/components/ui/alert";

export function ProfilePanel() {
  const { t, currentUser, isCheckingAuth, openLogin, refreshCurrentUser } = useLanding();
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarTick, setAvatarTick] = useState(0);

  useEffect(() => {
    setDisplayName(currentUser?.displayName ?? "");
  }, [currentUser?.displayName]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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

  const initial = (displayName || currentUser.email).trim().slice(0, 1).toUpperCase();
  const avatarSrc =
    previewUrl ??
    (currentUser.hasAvatar ? `/api/auth/me/avatar?v=${avatarTick}` : null);

  function onPickFile(next: File | null) {
    setSuccess("");
    setError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!next) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
  }

  async function save() {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      fd.append("displayName", displayName.trim());
      if (file) fd.append("avatar", file);
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        credentials: "include",
        body: fd,
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          body && typeof body === "object" && "message" in body && typeof body.message === "string"
            ? body.message
            : t.auth.networkError;
        setError(msg);
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(null);
      setPreviewUrl(null);
      setAvatarTick(Date.now());
      await refreshCurrentUser();
      setSuccess(t.profile.saved);
    } catch {
      setError(t.auth.networkError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
        {t.profile.title}
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t.profile.subtitle}</p>

      <div className="mt-8 flex flex-col gap-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center gap-3 sm:w-40">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-landing-orange/40 bg-slate-100 dark:bg-slate-800"
            aria-label={t.profile.changePhoto}
          >
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-landing-orange">
                {initial}
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/50 py-1 text-[10px] font-semibold text-white">
              <Camera className="h-3 w-3" aria-hidden />
              {t.profile.changePhoto}
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-center text-[11px] leading-snug text-slate-500">{t.profile.photoHint}</p>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t.profile.name}
            <input
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setSuccess("");
              }}
              placeholder={t.profile.namePlaceholder}
              maxLength={80}
              className="mt-1 h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none focus:border-landing-orange focus:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
            />
          </label>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t.profile.email}
            </p>
            <p className="mt-1 break-all text-sm font-medium text-slate-900 dark:text-slate-100">
              {currentUser.email}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t.profile.role}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              {currentUser.role}
            </p>
          </div>
          {error ? <Alert variant="error">{error}</Alert> : null}
          {success ? <Alert variant="success">{success}</Alert> : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-landing-orange px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? t.profile.saving : t.profile.save}
          </button>
        </div>
      </div>
    </div>
  );
}
