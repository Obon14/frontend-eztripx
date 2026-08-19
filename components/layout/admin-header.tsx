"use client";

import { Bell, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AdminHeader({ onOpenNav }: { onOpenNav?: () => void }) {
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
    <header className="border-b border-slate-200 bg-white p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Buka menu"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Menu className="h-4 w-4" aria-hidden />
        </button>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ThemeToggle tone="onLight" />
          <button
            type="button"
            className="hidden rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 sm:inline-flex dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div className="hidden rounded-lg bg-admin-accent-50 px-3 py-1.5 text-sm font-semibold text-admin-accent-700 sm:block">
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
            <span className="hidden sm:inline">{loggingOut ? "Keluar…" : "Keluar"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
