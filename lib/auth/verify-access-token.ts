import * as jose from "jose";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: string;
};

/**
 * Verifies access JWT (same secret as BE JWT_ACCESS_SECRET).
 * Returns payload or null if invalid/expired.
 */
export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload | null> {
  const secret = process.env.JWT_ACCESS_SECRET?.trim();
  if (!secret) return null;

  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, key);
    const sub = payload.sub;
    const email = payload.email;
    const role = payload.role;
    if (typeof sub !== "string" || typeof email !== "string" || typeof role !== "string") {
      return null;
    }
    return { sub, email, role };
  } catch {
    return null;
  }
}

export function isAdminRole(role: string): boolean {
  return role === "ADMIN";
}
