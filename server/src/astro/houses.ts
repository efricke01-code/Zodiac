import { normalizeDegrees, signIndexForLongitude } from "./constants.js";

export type HouseSystem = "whole-sign" | "equal";

export interface HouseCusp {
  house: number; // 1-12
  cuspLongitude: number; // degrees 0-360
}

/**
 * Returns the 12 house cusp longitudes (house 1 first) for the requested
 * house system, given the Ascendant's ecliptic longitude.
 *
 * Whole Sign: house 1 is the entire sign containing the Ascendant; each
 * subsequent house is the next whole sign. This is the oldest and simplest
 * house system and remains robust at all latitudes.
 *
 * Equal House: house 1 cusp sits exactly on the Ascendant degree, and each
 * subsequent cusp is 30 degrees further along the zodiac.
 */
export function computeHouseCusps(ascendant: number, system: HouseSystem): HouseCusp[] {
  const cusps: HouseCusp[] = [];
  if (system === "whole-sign") {
    const ascSignStart = signIndexForLongitude(ascendant) * 30;
    for (let i = 0; i < 12; i++) {
      cusps.push({ house: i + 1, cuspLongitude: normalizeDegrees(ascSignStart + i * 30) });
    }
  } else {
    for (let i = 0; i < 12; i++) {
      cusps.push({ house: i + 1, cuspLongitude: normalizeDegrees(ascendant + i * 30) });
    }
  }
  return cusps;
}

/** Finds which house (1-12) a given ecliptic longitude falls into. */
export function houseForLongitude(longitude: number, cusps: HouseCusp[]): number {
  const lon = normalizeDegrees(longitude);
  for (let i = 0; i < 12; i++) {
    const start = cusps[i].cuspLongitude;
    const end = cusps[(i + 1) % 12].cuspLongitude;
    const span = normalizeDegrees(end - start) || 360;
    const offset = normalizeDegrees(lon - start);
    if (offset < span) return cusps[i].house;
  }
  return 12;
}
