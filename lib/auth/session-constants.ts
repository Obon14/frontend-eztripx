/** Cookie max-age aligned with BE token TTL */
export const ACCESS_MAX_AGE_SEC = 60 * 15; // 15 minutes
export const REFRESH_MAX_AGE_SEC = 60 * 60 * 24 * 3; // 3 days

export function authCookieBaseOptions(isProd: boolean) {
  return {
    httpOnly: true as const,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };
}
