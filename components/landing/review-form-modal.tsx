"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { useLanding } from "@/components/landing/language-provider";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

export function ReviewFormModal({
  open,
  guideTitle,
  documentGuideId,
  defaultName,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  guideTitle: string;
  documentGuideId: string;
  defaultName: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const { t } = useLanding();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [displayName, setDisplayName] = useState(defaultName);
  const [travelerRole, setTravelerRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const name = displayName.trim();
    const text = comment.trim();
    if (!name || text.length < 10 || rating < 1) {
      setError(t.review.validation);
      setSuccess("");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          documentGuideId,
          rating,
          comment: text,
          displayName: name,
          travelerRole: travelerRole.trim() || undefined,
        }),
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
      setSuccess(t.review.thanks);
      onSubmitted();
    } catch {
      setError(t.auth.networkError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t.review.title} description={guideTitle}>
      <div className="space-y-4">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="rounded p-0.5"
                aria-label={`${value}`}
              >
                <Star
                  className={cn(
                    "h-6 w-6",
                    value <= rating
                      ? "fill-landing-orange text-landing-orange"
                      : "text-slate-300 dark:text-slate-600",
                  )}
                />
              </button>
            );
          })}
        </div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t.review.name}
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t.review.role}
          <input
            value={travelerRole}
            onChange={(e) => setTravelerRole(e.target.value)}
            placeholder={t.review.rolePlaceholder}
            className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t.review.comment}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.review.commentPlaceholder}
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{success}</p> : null}
        <button
          type="button"
          disabled={busy || Boolean(success)}
          onClick={() => void submit()}
          className="rounded-lg bg-landing-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? t.review.submitting : t.review.submit}
        </button>
      </div>
    </Modal>
  );
}
