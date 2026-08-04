export interface GeocodeResult {
  displayName: string;
  latitude: number;
  longitude: number;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "ZodiacAstrologyApp/1.0 (https://github.com/efricke01-code/zodiac)";

export async function geocodePlace(query: string): Promise<GeocodeResult[]> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "0");

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Geocoding service error (${res.status})`);
  }
  const data = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
  return data.map((entry) => ({
    displayName: entry.display_name,
    latitude: parseFloat(entry.lat),
    longitude: parseFloat(entry.lon),
  }));
}
