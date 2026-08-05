export interface GeocodeResult {
  displayName: string;
  latitude: number;
  longitude: number;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const PHOTON_URL = "https://photon.komoot.io/api/";
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

const MAX_ATTEMPTS = 3;

async function fetchFromNominatim(query: string, attempt = 1): Promise<GeocodeResult[]> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "0");

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });

  if (res.status === 429 && attempt < MAX_ATTEMPTS) {
    const retryAfterHeader = res.headers.get("retry-after");
    const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : 2000 * attempt;
    const waitMs = Number.isFinite(retryAfterMs) ? retryAfterMs : 2000 * attempt;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return fetchFromNominatim(query, attempt + 1);
  }

  if (!res.ok) {
    throw new Error(`nominatim-${res.status}`);
  }

  const data = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
  return data.map((entry) => ({
    displayName: entry.display_name,
    latitude: parseFloat(entry.lat),
    longitude: parseFloat(entry.lon),
  }));
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: Record<string, string | undefined>;
}

function photonDisplayName(properties: Record<string, string | undefined>): string {
  const parts = [properties.name, properties.city, properties.state, properties.country].filter(
    (part, i, arr): part is string => Boolean(part) && arr.indexOf(part) === i,
  );
  return parts.join(", ");
}

/** Photon (photon.komoot.io) is a separate free, keyless OSM geocoder run by Komoot on its own
 * infrastructure. It's used as a fallback when Nominatim is rate-limiting us, since the two
 * services don't share the same per-IP quota. */
async function fetchFromPhoton(query: string): Promise<GeocodeResult[]> {
  const url = new URL(PHOTON_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "5");

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`photon-${res.status}`);
  }

  const data = (await res.json()) as { features: PhotonFeature[] };
  return data.features
    .filter((f) => f.geometry?.coordinates?.length === 2)
    .map((f) => ({
      displayName: photonDisplayName(f.properties) || query,
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
    }));
}

export async function geocodePlace(query: string): Promise<GeocodeResult[]> {
  const key = cacheKey(query);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.results;
  }

  let results: GeocodeResult[];
  try {
    results = await throttled(() => fetchFromNominatim(query));
  } catch (nominatimErr) {
    try {
      results = await fetchFromPhoton(query);
    } catch {
      const status = nominatimErr instanceof Error ? nominatimErr.message : "unknown";
      if (status === "nominatim-429") {
        throw new Error(
          "The free place-lookup service is temporarily rate-limiting requests. Please wait a bit and try again.",
        );
      }
      throw new Error("Could not reach the geocoding service. Please try again in a moment.");
    }
  }

  cache.set(key, { results, expiresAt: Date.now() + CACHE_TTL_MS });
  return results;
}
