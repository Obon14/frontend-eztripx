"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table";
import { parseAdminReviewList } from "@/lib/review/parse-review";
import type { AdminReview } from "@/types/review";

export function ReviewListPage() {
  const [rows, setRows] = useState<AdminReview[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
      });
      const res = await fetch(`/api/review/admin?${qs}`, { credentials: "include" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          body && typeof body === "object" && "message" in body && typeof body.message === "string"
            ? body.message
            : "Failed to load reviews.",
        );
        setRows([]);
        return;
      }
      const parsed = parseAdminReviewList(body);
      setRows(parsed.data);
      setTotalPages(parsed.meta?.totalPages ?? 1);
    } catch {
      setError("Failed to load reviews.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: "published" | "rejected") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/review/admin/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(
          body && typeof body === "object" && "message" in body && typeof body.message === "string"
            ? body.message
            : "Failed to update review.",
        );
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Reviews</h1>
          <p className="mt-1 text-sm text-slate-500">
            Approve traveler reviews before they appear on the landing page.
          </p>
        </div>
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search comment, name, email…"
          className="max-w-xs"
        />
      </div>
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      <DataTable
        columns={[
          {
            key: "displayName",
            header: "Name",
            render: (row: AdminReview) => row.displayName,
          },
          {
            key: "email",
            header: "Email",
            render: (row: AdminReview) => row.userEmail ?? "—",
          },
          {
            key: "guide",
            header: "Guide",
            render: (row: AdminReview) => row.guideTitle ?? "—",
          },
          {
            key: "rating",
            header: "Rating",
            render: (row: AdminReview) => `${row.rating}/5`,
          },
          {
            key: "comment",
            header: "Comment",
            render: (row: AdminReview) => (
              <span className="line-clamp-2 max-w-xs text-sm">{row.comment}</span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (row: AdminReview) => (
              <Badge
                variant={
                  row.status === "published"
                    ? "primary"
                    : row.status === "rejected"
                      ? "danger"
                      : "accent"
                }
              >
                {row.status}
              </Badge>
            ),
          },
          {
            key: "action",
            header: "Action",
            render: (row: AdminReview) => (
              <div className="flex flex-wrap gap-1">
                {row.status !== "published" ? (
                  <Button
                    size="sm"
                    disabled={busyId === row.id}
                    onClick={() => void setStatus(row.id, "published")}
                  >
                    Publish
                  </Button>
                ) : null}
                {row.status !== "rejected" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === row.id}
                    onClick={() => void setStatus(row.id, "rejected")}
                  >
                    Reject
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
        data={rows}
        getRowKey={(row) => row.id}
        emptyMessage={loading ? "Loading…" : "No reviews yet."}
      />
      {totalPages > 1 ? (
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
