import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
