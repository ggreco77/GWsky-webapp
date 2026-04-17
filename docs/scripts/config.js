// ==============================
// GLOBAL CONFIG (shared module)
// ==============================

export const PROXY = "https://gwsky-web-app.giuseppe-greco.workers.dev";

export function proxyUrl(url) {
  return `${PROXY}?url=${encodeURIComponent(url)}`;
}

export async function fetchFitsAsBytes(url) {
  const res = await fetch(proxyUrl(url));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}