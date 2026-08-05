import type {
  BirthChartResponse, BirthInput, GeocodeResult, UpcomingEventsResponse,
  HoroscopeResult, HoroscopePeriod, NatalChart, TransitPlacement,
  Sign, PlanetKey, AspectType, MoonPhaseName,
} from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function geocodePlace(query: string) {
  return request<{ results: GeocodeResult[] }>("/geocode", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export function fetchBirthChart(input: BirthInput) {
  return request<BirthChartResponse>("/birth-chart", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchCurrentSky(date?: string) {
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  return request<{ date: string; positions: TransitPlacement[] }>(`/current-sky${qs}`);
}

export function fetchUpcomingEvents(days = 90, from?: string) {
  const params = new URLSearchParams({ days: String(days) });
  if (from) params.set("from", from);
  return request<UpcomingEventsResponse>(`/upcoming-events?${params.toString()}`);
}

export function fetchHoroscope(chart: NatalChart, period: HoroscopePeriod, from?: string) {
  return request<HoroscopeResult>("/horoscope", {
    method: "POST",
    body: JSON.stringify({ chart, period, from }),
  });
}

export function fetchSignHouseInterpretation(sign: Sign, house: number) {
  return request<{ paragraph: string }>(`/interpret/sign-house?sign=${sign}&house=${house}`);
}

export function fetchPlacementInterpretation(planet: PlanetKey, sign: Sign, house: number, retrograde: boolean) {
  return request<{ paragraph: string }>(
    `/interpret/placement?planet=${planet}&sign=${sign}&house=${house}&retrograde=${retrograde}`,
  );
}

export function fetchPlanetSignInterpretation(planet: PlanetKey, sign: Sign) {
  return request<{ paragraph: string }>(`/interpret/planet-sign?planet=${planet}&sign=${sign}`);
}

export function fetchMoonEventInterpretation(
  phase: MoonPhaseName, eventSign: Sign, natalSign: Sign, natalPlanet: PlanetKey = "Sun",
) {
  return request<{ paragraph: string }>(
    `/interpret/moon-event?phase=${phase}&eventSign=${eventSign}&natalSign=${natalSign}&natalPlanet=${natalPlanet}`,
  );
}

export function fetchIngressInterpretation(
  planet: PlanetKey, toSign: Sign, natalSign: Sign, natalPlanet: PlanetKey = "Sun",
) {
  return request<{ paragraph: string }>(
    `/interpret/ingress?planet=${planet}&toSign=${toSign}&natalSign=${natalSign}&natalPlanet=${natalPlanet}`,
  );
}

export function fetchTransitToNatalInterpretation(
  transitingPlanet: PlanetKey, transitSign: Sign, aspect: AspectType,
  natalPlanet: PlanetKey, natalSign: Sign, natalHouse: number,
) {
  return request<{ paragraph: string }>(
    `/interpret/transit-to-natal?transitingPlanet=${transitingPlanet}&transitSign=${transitSign}` +
    `&aspect=${aspect}&natalPlanet=${natalPlanet}&natalSign=${natalSign}&natalHouse=${natalHouse}`,
  );
}
