"use client";

import { Pencil, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/ui/table";
import { parseUserList } from "@/lib/user/parse-user";
import type { AdminUserRole, AdminUserRow } from "@/types/user-api";

type UserForm = {
  email: string;
  password: string;
  role: AdminUserRole;
};

const emptyForm: UserForm = { email: "", password: "", role: "USER" };

export function UserListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);

  const loadRows = useCallback(
    async (q: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: "1", limit: "50", search: q });
        const res = await fetch(`/api/users?${params}`, { credentials: "include" });
        if (res.status === 401) {
          router.push("/admin");
          return;
        }
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            body && typeof body === "object" && "message" in body && typeof body.message === "string"
              ? body.message
              : `Gagal memuat user (${res.status}).`;
          setError(msg);
          setRows([]);
          return;
        }
        setRows(parseUserList(body).data);
      } catch {
        setError("Tidak dapat memuat daftar user.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    const t = window.setTimeout(() => void loadRows(search.trim()), search ? 300 : 0);
    return () => window.clearTimeout(t);
  }, [search, loadRows]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setOpen(true);
  }

  function openEdit(row: AdminUserRow) {
    setEditingId(row.id);
    setForm({ email: row.email, password: "", role: row.role });
    setFormError(null);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  async function submitForm() {
    setFormError(null);
    const email = form.email.trim();
    if (!email) {
      setFormError("Email wajib diisi.");
      return;
    }
    if (!editingId && !form.password) {
      setFormError("Password wajib diisi untuk user baru.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, string> = { email, role: form.role };
      if (form.password) payload.password = form.password;

      const url = editingId ? `/api/users/${encodeURIComponent(editingId)}` : "/api/users";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          body && typeof body === "object" && "message" in body && typeof body.message === "string"
            ? body.message
            : "Request gagal.";
        setFormError(msg);
        return;
      }

      await loadRows(search.trim());
      closeModal();
    } catch {
      setFormError("Tidak dapat menghubungi server.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          body && typeof body === "object" && "message" in body && typeof body.message === "string"
            ? body.message
            : "Gagal menghapus user.";
        setFormError(msg);
        return;
      }
      setDeleteTarget(null);
      await loadRows(search.trim());
    } catch {
      setFormError("Tidak dapat menghubungi server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="mt-1 text-sm text-slate-600">
              Kelola akun USER dan ADMIN. Registrasi publik di landing hanya membuat role USER.
            </p>
          </div>
          <Button onClick={openCreate}>Tambah User</Button>
        </div>

        <div className="p-5">
          <div className="relative mb-4 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Cari email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          {loading && rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Memuat…</p>
          ) : (
            <DataTable
              data={rows}
              getRowKey={(row) => row.id}
              emptyMessage="Belum ada user."
              columns={[
                { key: "email", header: "Email", render: (row) => row.email },
                {
                  key: "role",
                  header: "Role",
                  render: (row) => (
                    <Badge variant={row.role === "ADMIN" ? "primary" : "accent"}>{row.role}</Badge>
                  ),
                },
                {
                  key: "created",
                  header: "Dibuat",
                  render: (row) =>
                    row.createdAt ? new Date(row.createdAt).toLocaleDateString("id-ID") : "—",
                },
                {
                  key: "action",
                  header: "Aksi",
                  render: (row) => (
                    <div className="flex gap-1">
                      <Button type="button" size="sm" variant="ghost" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => {
                          setFormError(null);
                          setDeleteTarget(row);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => !submitting && closeModal()}
        title={editingId ? "Edit User" : "Tambah User"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeModal} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={() => void submitForm()} disabled={submitting}>
              {submitting ? "Menyimpan…" : "Simpan"}
            </Button>
          </div>
        }
      >
        {formError ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {formError}
          </div>
        ) : null}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              disabled={submitting}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password {editingId ? "(kosongkan jika tidak diubah)" : ""}
            </label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              disabled={submitting}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
            <Select
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({ ...f, role: e.target.value as AdminUserRole }))
              }
              disabled={submitting}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </Select>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => !submitting && setDeleteTarget(null)}
        title="Hapus user?"
        description={
          deleteTarget
            ? `Yakin hapus ${deleteTarget.email}? Tidak bisa jika user punya order.`
            : undefined
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={submitting}>
              Batal
            </Button>
            <Button variant="danger" onClick={() => void confirmDelete()} disabled={submitting}>
              Hapus
            </Button>
          </div>
        }
      >
        {formError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {formError}
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
