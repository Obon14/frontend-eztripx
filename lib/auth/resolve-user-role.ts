import { verifyAccessToken } from "@/lib/auth/verify-access-token";

function readRoleFromMeBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const user =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  const role = user.role;
  return typeof role === "string" ? role : null;
}

/**
 * Resolves role from access token: JWT verify first, then GET /auth/me fallback.
 */
export async function resolveUserRole(
  apiBase: string,
  accessToken: string,
): Promise<string | null> {
  const fromJwt = await verifyAccessToken(accessToken);
  if (fromJwt?.role) return fromJwt.role;

  try {
    const res = await fetch(`${apiBase.replace(/\/$/, "")}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = await res.json().catch(() => null);
    return readRoleFromMeBody(body);
  } catch {
    return null;
  }
}
