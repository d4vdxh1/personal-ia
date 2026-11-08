const hosts = [
  "fcm.googleapis.com", "updates.push.services.mozilla.com",
  "web.push.apple.com", "webpush.push.apple.com",
];
const keyPattern = /^[A-Za-z0-9_-]+$/;
export type PushInput = { endpoint: string; keys: { p256dh: string; auth: string } };
export function parsePushSubscription(value: unknown): PushInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (Object.keys(v).sort().join(",") !== "endpoint,keys" ||
    typeof v.endpoint !== "string" || v.endpoint.length > 2048 || v.endpoint.length < 20) return null;
  let url: URL;
  try { url = new URL(v.endpoint); } catch { return null; }
  if (url.protocol !== "https:" || url.username || url.password || url.port ||
      url.hash || url.pathname.length < 2 || !hosts.includes(url.hostname) ||
      url.href !== v.endpoint) return null;
  const keys = v.keys;
  if (!keys || typeof keys !== "object" || Array.isArray(keys)) return null;
  const pair = keys as Record<string, unknown>;
  if (Object.keys(pair).sort().join(",") !== "auth,p256dh") return null;
  if (typeof pair.p256dh !== "string" || typeof pair.auth !== "string" ||
    pair.p256dh.length < 60 || pair.p256dh.length > 200 ||
    pair.auth.length < 16 || pair.auth.length > 100 ||
    !keyPattern.test(pair.p256dh) || !keyPattern.test(pair.auth)) return null;
  return { endpoint: v.endpoint, keys: { p256dh: pair.p256dh, auth: pair.auth } };
}
export function parsePushEndpoint(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string,unknown>;
  if (Object.keys(v).join(",") !== "endpoint" || typeof v.endpoint !== "string") return null;
  // Endpoint-only requests are allowed on unsubscribe.
  return parsePushSubscription({ endpoint:v.endpoint, keys: {p256dh:"a".repeat(87),auth:"b".repeat(22)} })?.endpoint ?? null;
}
