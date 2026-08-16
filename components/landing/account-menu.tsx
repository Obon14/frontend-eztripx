"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useLanding } from "@/components/landing/language-provider";
import { cn } from "@/lib/utils";

export function AccountMenu() {
  const { t, currentUser, logout } = useLanding();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (wrapRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!currentUser) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={t.nav.accountMenu}
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-[220px] items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
      >
        <span className="truncate" title={currentUser.email}>
          {currentUser.email}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-[80] mt-2 w-56 overflow-hidden rounded-xl border border-white/15 bg-landing-forest py-1 shadow-xl ring-1 ring-black/20"
        >
          <p className="truncate border-b border-white/10 px-3 py-2 text-xs text-white/60" title={currentUser.email}>
            {currentUser.email}
          </p>
          <Link
            role="menuitem"
            href="/profile"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-white/90 transition hover:bg-white/10 hover:text-landing-orange"
          >
            {t.nav.profile}
          </Link>
          <Link
            role="menuitem"
            href="/orders"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-white/90 transition hover:bg-white/10 hover:text-landing-orange"
          >
            {t.nav.orders}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
            className="block w-full border-t border-white/10 px-3 py-2 text-left text-sm text-white/90 transition hover:bg-white/10 hover:text-landing-orange"
          >
            {t.nav.logout}
          </button>
        </div>
      ) : null}
    </div>
  );
}
