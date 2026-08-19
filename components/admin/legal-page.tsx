"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { parseAdminLegal, parseAdminLegalList } from "@/lib/legal/parse-legal";
import { cn } from "@/lib/utils";
import type { AdminLegalDocument, LegalSlug } from "@/types/legal";

type Draft = Pick<
  AdminLegalDocument,
  | "titleId"
  | "titleEn"
  | "titleHighlightId"
  | "titleHighlightEn"
  | "introId"
  | "introEn"
  | "bodyId"
  | "bodyEn"
>;

const emptyDraft: Draft = {
  titleId: "",
  titleEn: "",
  titleHighlightId: "",
  titleHighlightEn: "",
  introId: "",
  introEn: "",
  bodyId: "",
  bodyEn: "",
};

function toDraft(row: AdminLegalDocument): Draft {
  return {
    titleId: row.titleId,
    titleEn: row.titleEn,
    titleHighlightId: row.titleHighlightId,
    titleHighlightEn: row.titleHighlightEn,
    introId: row.introId,
    introEn: row.introEn,
    bodyId: row.bodyId,
    bodyEn: row.bodyEn,
  };
}

export function LegalAdminPage() {
  const [tab, setTab] = useState<LegalSlug>("terms");
  const [rows, setRows] = useState<AdminLegalDocument[]>([]);
  const [drafts, setDrafts] = useState<Record<LegalSlug, Draft>>({
    terms: emptyDraft,
    privacy: emptyDraft,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/legal/admin", { credentials: "include" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          body && typeof body === "object" && "message" in body && typeof body.message === "string"
            ? body.message
            : "Failed to load legal documents.",
        );
        setRows([]);
        return;
      }
      const parsed = parseAdminLegalList(body);
      setRows(parsed);
      setDrafts({
        terms: parsed.find((row) => row.slug === "terms")
          ? toDraft(parsed.find((row) => row.slug === "terms")!)
          : emptyDraft,
        privacy: parsed.find((row) => row.slug === "privacy")
          ? toDraft(parsed.find((row) => row.slug === "privacy")!)
          : emptyDraft,
      });
    } catch {
      setError("Failed to load legal documents.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const current = rows.find((row) => row.slug === tab) ?? null;
  const draft = drafts[tab];
  const savedDraft = useMemo(
    () => (current ? toDraft(current) : emptyDraft),
    [current],
  );
  const dirty = JSON.stringify(draft) !== JSON.stringify(savedDraft);

  function patchDraft(patch: Partial<Draft>) {
    setSuccess(null);
    setDrafts((prev) => ({ ...prev, [tab]: { ...prev[tab], ...patch } }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/legal/admin/${tab}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(draft),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          body && typeof body === "object" && "message" in body && typeof body.message === "string"
            ? body.message
            : "Failed to save legal document.",
        );
        return;
      }
      const parsed = parseAdminLegal(body);
      if (parsed) {
        setRows((prev) => {
          const next = prev.filter((row) => row.slug !== parsed.slug);
          next.push(parsed);
          return next.sort((a, b) => a.slug.localeCompare(b.slug));
        });
        setDrafts((prev) => ({ ...prev, [parsed.slug]: toDraft(parsed) }));
      } else {
        await load();
      }
      setSuccess("Saved.");
    } catch {
      setError("Failed to save legal document.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Legal</h1>
        <p className="mt-1 text-sm text-slate-500">
          Edit public Terms and Privacy pages. Indonesian and English are saved together. Body uses Markdown
          (<code className="text-xs">##</code> heading, <code className="text-xs">-</code> list).
        </p>
      </div>

      <div className="mb-5 flex gap-2">
        {(
          [
            { id: "terms", label: "Terms" },
            { id: "privacy", label: "Privacy" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              setSuccess(null);
              setError(null);
            }}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition",
              tab === item.id
                ? "bg-admin-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}
      {success ? <Alert variant="success" className="mb-4">{success}</Alert> : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : !current ? (
        <p className="text-sm text-slate-500">
          No legal documents yet. Run <code className="text-xs">npx tsx prisma/seed-legal.ts</code> in the backend.
        </p>
      ) : (
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <Field label="Title (ID)">
            <Input value={draft.titleId} onChange={(e) => patchDraft({ titleId: e.target.value })} required maxLength={80} />
          </Field>
          <Field label="Title (EN)">
            <Input value={draft.titleEn} onChange={(e) => patchDraft({ titleEn: e.target.value })} required maxLength={80} />
          </Field>
          <Field label="Title highlight (ID)">
            <Input
              value={draft.titleHighlightId}
              onChange={(e) => patchDraft({ titleHighlightId: e.target.value })}
              required
              maxLength={80}
            />
          </Field>
          <Field label="Title highlight (EN)">
            <Input
              value={draft.titleHighlightEn}
              onChange={(e) => patchDraft({ titleHighlightEn: e.target.value })}
              required
              maxLength={80}
            />
          </Field>
          <Field label="Intro (ID)" className="md:col-span-2">
            <Textarea
              value={draft.introId}
              onChange={(e) => patchDraft({ introId: e.target.value })}
              required
              maxLength={4000}
              className="min-h-24"
            />
          </Field>
          <Field label="Intro (EN)" className="md:col-span-2">
            <Textarea
              value={draft.introEn}
              onChange={(e) => patchDraft({ introEn: e.target.value })}
              required
              maxLength={4000}
              className="min-h-24"
            />
          </Field>
          <Field label="Body Markdown (ID)" className="md:col-span-2">
            <Textarea
              value={draft.bodyId}
              onChange={(e) => patchDraft({ bodyId: e.target.value })}
              required
              className="min-h-64 font-mono text-xs leading-relaxed"
            />
          </Field>
          <Field label="Body Markdown (EN)" className="md:col-span-2">
            <Textarea
              value={draft.bodyEn}
              onChange={(e) => patchDraft({ bodyEn: e.target.value })}
              required
              className="min-h-64 font-mono text-xs leading-relaxed"
            />
          </Field>
          <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Last saved: {current.updatedAt ? new Date(current.updatedAt).toLocaleString("id-ID") : "—"}
              {dirty ? " · unsaved changes" : ""}
            </p>
            <Button type="submit" disabled={saving || !dirty} className="w-full sm:w-auto">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      {children}
    </div>
  );
}
