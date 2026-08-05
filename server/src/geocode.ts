export interface GeocodeResult {
  displayName: string;
  latitude: number;
  longitude: number;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "ZodiacAstrologyApp/1.0 (https://github.com/efricke01-code/zodiac)";

// Nominatim's usage policy caps free requests at ~1/second per IP. On shared hosting
// (e.g. Render's free tier), other tenants on the same outbound IP can eat into that
// budget too, so we self-throttle to be a good citizen and reduce how often we trip it.
const MIN_REQUEST_GAP_MS = 1100;
let queue: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = MIN_REQUEST_GAP_MS - (Date.now() - lastRequestAt);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequestAt = Date.now();
    return fn();
  });
  // Keep the queue alive even if this particular call fails, so one bad request
  // doesn't block everything behind it.
  queue = run.catch(() => undefined);
  return run;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { results: GeocodeResult[]; expiresAt: number }>();

function cacheKey(query: string): string {
  return query.trim().toLowerCase();
}

async function fetchFromNominatim(query: string, attempt = 1): Promise<GeocodeResult[]> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "0");

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });

  if (res.status === 429 && attempt === 1) {
    const retryAfterHeader = res.headers.get("retry-after");
    const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : 2000;
    await new Promise((resolve) => setTimeout(resolve, Number.isFinite(retryAfterMs) ? retryAfterMs : 2000));
    return fetchFromNominatim(query, attempt + 1);
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(
        "The free place-lookup service is temporarily rate-limiting requests. Please wait a few seconds and try again.",
      );
    }
    throw new Error(`Geocoding service error (${res.status})`);
  }

  const data = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
  return data.map((entry) => ({
    displayName: entry.display_name,
    latitude: parseFloat(entry.lat),
    longitude: parseFloat(entry.lon),
  }));
}

export async function geocodePlace(query: string): Promise<GeocodeResult[]> {
  const key = cacheKey(query);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.results;
  }

  const results = await throttled(() => fetchFromNominatim(query));
  cache.set(key, { results, expiresAt: Date.now() + CACHE_TTL_MS });
  return results;
}
