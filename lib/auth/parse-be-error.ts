/** Extract message from NestJS error JSON or plain text */
export function parseBeErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const msg = (data as { message?: unknown }).message;
  if (typeof msg === "string") return msg;
  if (Array.isArray(msg) && msg.length > 0) {
    const first = msg[0];
    return typeof first === "string" ? first : fallback;
  }
  return fallback;
}
