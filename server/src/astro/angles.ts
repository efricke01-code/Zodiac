import { siderealTimeDeg, trueObliquityDeg } from "./ephemeris.js";
import { normalizeDegrees } from "./constants.js";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

export interface Angles {
  ascendant: number; // ecliptic longitude, degrees
  midheaven: number; // ecliptic longitude, degrees
  ramc: number; // right ascension of the midheaven, degrees
  obliquity: number;
}

/**
 * Computes the Ascendant and Midheaven ecliptic longitudes for a given
 * moment (UTC) and geographic location, using the standard formulas from
 * spherical astronomy (see e.g. Meeus, "Astronomical Algorithms").
 */
export function computeAngles(dateUtc: Date, latitude: number, longitude: number): Angles {
  const obliquity = trueObliquityDeg(dateUtc);
  const gast = siderealTimeDeg(dateUtc);
  const ramc = normalizeDegrees(gast + longitude); // Local sidereal time in degrees

  const ramcRad = ramc * D2R;
  const oblRad = obliquity * D2R;
  const latRad = latitude * D2R;

  const mcRad = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(oblRad));
  const midheaven = normalizeDegrees(mcRad * R2D);

  const ascRad = Math.atan2(
    Math.cos(ramcRad),
    -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(ramcRad)),
  );
  const ascendant = normalizeDegrees(ascRad * R2D);

  return { ascendant, midheaven, ramc, obliquity };
}
