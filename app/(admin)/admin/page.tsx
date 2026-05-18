"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginJson = { ok?: boolean; message?: string; error?: string };

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email belum valid.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => null)) as LoginJson | null;
      const msg =
        data?.message ??
        (typeof data?.error === "string" ? data.error : null) ??
        (res.ok ? null : "Login gagal.");
      if (!res.ok) {
        setError(msg ?? "Login gagal.");
        return;
      }
      router.push("/admin/home");
    } catch {
      setError("Tidak bisa menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-admin-primary-50 via-white to-admin-accent-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-orange-100 bg-white p-8 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wide text-admin-accent-700">EzTripx Admin</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Login</h1>
        <p className="mt-1 text-sm text-slate-600">Masuk untuk mengelola data document guide traveler.</p>

        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          {error ? <Alert variant="error">{error}</Alert> : null}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <Input
              type="email"
              placeholder="admin@extripx.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <Input
              type="password"
              placeholder="********"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses…" : "Masuk ke Admin"}
          </Button>
        </form>

        <p className="mt-4 text-xs text-slate-500">
          Sesi disimpan sebagai cookie HttpOnly. Akses halaman ini lewat{" "}
          <span className="font-mono text-slate-700">/admin</span>.
        </p>
      </div>
    </div>
  );
}
