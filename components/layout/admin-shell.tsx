"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [navPathname, setNavPathname] = useState(pathname);

  if (navPathname !== pathname) {
    setNavPathname(pathname);
    setNavOpen(false);
  }

  useEffect(() => {
    if (!navOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setNavOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  return (
    <div className="flex min-h-dvh bg-slate-100 dark:bg-slate-950">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <AdminHeader onOpenNav={() => setNavOpen(true)} />
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
