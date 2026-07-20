import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Column<T> = {
  key: keyof T | string;
  header: string;
  render: (row: T, rowIndex: number) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  getRowKey?: (row: T, index: number) => string;
};

export function DataTable<T>({
  columns,
  data,
  emptyMessage = "No data found.",
  className,
  getRowKey,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 ${column.className ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500 dark:text-slate-400" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={getRowKey?.(row, rowIndex) ?? rowIndex}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  {columns.map((column) => (
                    <td
                      key={`${String(column.key)}-${rowIndex}`}
                      className={`px-4 py-3 text-slate-700 dark:text-slate-300 ${column.className ?? ""}`}
                    >
                      {column.render(row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
