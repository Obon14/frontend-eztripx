"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark";

/** Visual tone so the toggle blends into either the dark landing header or the light admin header. */
type ThemeToggleTone = "onDark" | "onLight";

const STORAGE_KEY = "eztripx-theme";

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const toneStyles: Record<ThemeToggleTone, string> = {
  onDark:
    "border-white/20 text-white/90 hover:border-landing-orange hover:text-landing-orange focus-visible:ring-white/40",
  onLight:
    "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-admin-primary-700 focus-visible:ring-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-admin-primary-700",
};

export function ThemeToggle({
  tone = "onLight",
  className,
}: {
  tone?: ThemeToggleTone;
  className?: string;
}) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const next = getPreferredTheme();
    setTheme(next);
    applyTheme(next);
    setMounted(true);
  }, []);

  const isDark = theme === "dark";
  const nextLabel = isDark ? "terang" : "gelap";

  return (
    <button
      type="button"
      onClick={() => {
        const next: ThemeMode = isDark ? "light" : "dark";
        setTheme(next);
        applyTheme(next);
        window.localStorage.setItem(STORAGE_KEY, next);
      }}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2",
        toneStyles[tone],
        className,
      )}
      aria-label={`Aktifkan mode ${nextLabel}`}
      title={mounted ? `Mode: ${isDark ? "gelap" : "terang"}` : "Ubah tema"}
    >
      {isDark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
      <span className="sr-only">{mounted ? `Mode ${isDark ? "gelap" : "terang"}` : "Ubah tema"}</span>
    </button>
  );
}
