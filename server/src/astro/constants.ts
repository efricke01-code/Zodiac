export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export type Sign = (typeof SIGNS)[number];

export const SIGN_GLYPHS: Record<Sign, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

export const PLANET_KEYS = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
  "Uranus", "Neptune", "Pluto", "NorthNode",
] as const;

export type PlanetKey = (typeof PLANET_KEYS)[number];

export const PLANET_GLYPHS: Record<PlanetKey, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆",
  Pluto: "♇", NorthNode: "☊",
};

export const PLANET_LABELS: Record<PlanetKey, string> = {
  Sun: "Sun", Moon: "Moon", Mercury: "Mercury", Venus: "Venus", Mars: "Mars",
  Jupiter: "Jupiter", Saturn: "Saturn", Uranus: "Uranus", Neptune: "Neptune",
  Pluto: "Pluto", NorthNode: "North Node",
};

/** Bodies whose retrograde status is meaningful (Sun/Moon/Node excluded). */
export const CAN_RETROGRADE: PlanetKey[] = [
  "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
];

export function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

export function signIndexForLongitude(lon: number): number {
  return Math.floor(normalizeDegrees(lon) / 30) % 12;
}

export function signForLongitude(lon: number): Sign {
  return SIGNS[signIndexForLongitude(lon)];
}

export function degreeWithinSign(lon: number): number {
  return normalizeDegrees(lon) % 30;
}

export interface SignPlacement {
  sign: Sign;
  degree: number; // 0-30 within sign
  longitude: number; // absolute 0-360
}

export function placementForLongitude(lon: number): SignPlacement {
  const longitude = normalizeDegrees(lon);
  return { sign: signForLongitude(longitude), degree: degreeWithinSign(longitude), longitude };
}

export function formatDegree(degree: number): string {
  const d = Math.floor(degree);
  const m = Math.floor((degree - d) * 60);
  return `${d}°${m.toString().padStart(2, "0")}'`;
}
