"use client";

import { Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminHeader() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      setLoggingOut(false);
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white p-4">
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="rounded-lg bg-admin-accent-50 px-3 py-1.5 text-sm font-semibold text-admin-accent-700">
          Admin
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "Keluar…" : "Keluar"}
        </Button>
      </div>
    </header>
  );
}
