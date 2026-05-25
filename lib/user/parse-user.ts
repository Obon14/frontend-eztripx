import type { AdminUserRow, AdminUserRole } from "@/types/user-api";
import type { ListMeta } from "@/types/geo-api";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function parseRole(v: unknown): AdminUserRole | null {
  return v === "USER" || v === "ADMIN" ? v : null;
}

export function parseUserRow(raw: unknown): AdminUserRow | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === "string" ? raw.id : null;
  const email = typeof raw.email === "string" ? raw.email : null;
  const role = parseRole(raw.role);
  if (!id || !email || !role) return null;
  return {
    id,
    email,
    role,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : "",
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : "",
  };
}

export function parseUserList(body: unknown): {
  data: AdminUserRow[];
  meta: ListMeta | null;
} {
  if (!isRecord(body) || !Array.isArray(body.data)) {
    return { data: [], meta: null };
  }
  const data: AdminUserRow[] = [];
  for (const row of body.data) {
    const parsed = parseUserRow(row);
    if (parsed) data.push(parsed);
  }
  const metaRaw = body.meta;
  let meta: ListMeta | null = null;
  if (isRecord(metaRaw)) {
    const page = Number(metaRaw.page);
    const limit = Number(metaRaw.limit);
    const total = Number(metaRaw.total);
    const totalPages = Number(metaRaw.totalPages);
    if ([page, limit, total, totalPages].every((n) => Number.isFinite(n))) {
      meta = { page, limit, total, totalPages };
    }
  }
  return { data, meta };
}
