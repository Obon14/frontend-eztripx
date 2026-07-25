"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type RowActionMenuItem = {
  key: string;
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
};

type RowActionMenuProps = {
  label: string;
  items: RowActionMenuItem[];
};

export function RowActionMenu({ label, items }: RowActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
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

  useEffect(() => {
    if (!open) {
      setStyle(null);
      return;
    }
    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const menuWidth = 180;
      const gap = 4;
      const left = Math.min(
        Math.max(8, rect.right - menuWidth),
        window.innerWidth - menuWidth - 8,
      );
      const spaceBelow = window.innerHeight - rect.bottom - gap - 8;
      const placeAbove = spaceBelow < 160 && rect.top > spaceBelow;
      setStyle({
        position: "fixed",
        top: placeAbove ? undefined : rect.bottom + gap,
        bottom: placeAbove ? window.innerHeight - rect.top + gap : undefined,
        left,
        width: menuWidth,
        zIndex: 140,
      });
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && style
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              style={style}
              className="rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
            >
              {items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  className={cn(
                    "flex w-full px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50",
                    item.tone === "danger"
                      ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800",
                  )}
                  onClick={() => {
                    if (item.disabled) return;
                    setOpen(false);
                    item.onSelect();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
