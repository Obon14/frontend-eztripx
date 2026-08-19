"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { adminMenu } from "@/lib/constants/admin-menu";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  /** Controls the mobile drawer. Desktop keeps the sidebar always visible. */
  open?: boolean;
  onClose?: () => void;
};

export function AdminSidebar({ open = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const nav = (
    <nav className="space-y-1">
      {adminMenu.map((item) => {
        const isActive =
          item.href === "/admin/home"
            ? pathname === "/admin/home"
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-admin-primary-50 text-admin-primary-700 dark:bg-admin-primary/15"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 lg:block dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 px-2">
          <p className="text-xs font-semibold tracking-wide text-admin-accent-700">EzTripx</p>
          <h1 className="text-xl font-bold text-admin-primary-700">Admin Panel</h1>
        </div>
        {nav}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={onClose}
            className="absolute inset-0 h-full w-full bg-slate-950/50 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(17rem,84vw)] flex-col overflow-y-auto overscroll-contain border-r border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-start justify-between gap-3 px-2">
              <div>
                <p className="text-xs font-semibold tracking-wide text-admin-accent-700">EzTripx</p>
                <h1 className="text-xl font-bold text-admin-primary-700">Admin Panel</h1>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            {nav}
          </div>
        </div>
      ) : null}
    </>
  );
}
