"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminMenu } from "@/lib/constants/admin-menu";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4">
      <div className="mb-8 px-2">
        <p className="text-xs font-semibold tracking-wide text-admin-accent-700">EzTripx</p>
        <h1 className="text-xl font-bold text-admin-primary-700">Admin Panel</h1>
      </div>
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
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-admin-primary-50 text-admin-primary-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
