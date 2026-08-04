import { createRequire } from "module";
import type * as AstronomyTypes from "astronomy-engine";
import { PlanetKey } from "./constants.js";

// astronomy-engine's package "exports" map resolves to different builds under
// tsx (CJS) vs. plain Node ESM (its ESM build, which has no default export),
// so a static default/namespace import behaves inconsistently between dev and
// production runners. Going through createRequire pins us to the CJS build in
// both cases, which is stable either way.
const require = createRequire(import.meta.url);
const Astronomy = require("astronomy-engine") as typeof AstronomyTypes;

const BODY_MAP: Record<Exclude<PlanetKey, "NorthNode">, AstronomyTypes.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

/** True obliquity of the ecliptic, in degrees, at the given time. */
export function trueObliquityDeg(date: Date): number {
  const t = Astronomy.MakeTime(date);
  return Astronomy.e_tilt(t).tobl;
}

/** Greenwich Apparent Sidereal Time in degrees [0, 360). */
export function siderealTimeDeg(date: Date): number {
  return Astronomy.SiderealTime(date) * 15;
}

/**
 * Geocentric apparent ecliptic longitude of date (tropical zodiac position),
 * in degrees [0, 360), for one of the ten classical/modern planets or the Sun/Moon.
 */
export function geocentricEclipticLongitude(planet: Exclude<PlanetKey, "NorthNode">, date: Date): number {
  const time = Astronomy.MakeTime(date);

  if (planet === "Sun") {
    return Astronomy.SunPosition(time).elon;
  }

  const vec =
    planet === "Moon"
      ? Astronomy.GeoMoon(time)
      : Astronomy.GeoVector(BODY_MAP[planet], time, true);

  const rot = Astronomy.Rotation_EQJ_ECT(time);
  const ect = Astronomy.RotateVector(rot, vec);
  let lon = (Math.atan2(ect.y, ect.x) * 180) / Math.PI;
  if (lon < 0) lon += 360;
  return lon;
}

/**
 * Mean lunar North Node longitude (Meeus, ch. 47), degrees [0, 360).
 * The "True Node" oscillates around this; the mean node is the standard
 * reference point used in most astrology software.
 */
export function meanNorthNodeLongitude(date: Date): number {
  const time = Astronomy.MakeTime(date);
  const T = time.tt / 36525; // Julian centuries from J2000 TT
  let omega =
    125.0445479 -
    1934.1362891 * T +
    0.0020754 * T * T +
    (T * T * T) / 467441 -
    (T * T * T * T) / 60616000;
  omega %= 360;
  if (omega < 0) omega += 360;
  return omega;
}

export function eclipticLongitudeFor(planet: PlanetKey, date: Date): number {
  if (planet === "NorthNode") return meanNorthNodeLongitude(date);
  return geocentricEclipticLongitude(planet, date);
}

/** Moon phase angle: 0=new, 90=first quarter, 180=full, 270=last quarter. */
export function moonPhaseAngle(date: Date): number {
  return Astronomy.MoonPhase(date);
}
