/**
 * Canonical site origin for SEO (sitemap, robots, Open Graph).
 * Set NEXT_PUBLIC_SITE_URL in production, e.g. https://eztripx.com
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }

  return "https://eztripx.com";
}
