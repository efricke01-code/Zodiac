import {
  PLANET_KEYS,
  PlanetKey,
  CAN_RETROGRADE,
  placementForLongitude,
  SignPlacement,
} from "./constants.js";
import { eclipticLongitudeFor } from "./ephemeris.js";
import { computeAngles } from "./angles.js";
import { computeHouseCusps, houseForLongitude, HouseCusp, HouseSystem } from "./houses.js";
import { findAspect, FoundAspect } from "./aspects.js";

export interface PlanetPlacement extends SignPlacement {
  planet: PlanetKey;
  house: number;
  retrograde: boolean;
}

export interface ChartAspect extends FoundAspect {
  a: PlanetKey;
  b: PlanetKey;
}

export interface NatalChart {
  dateUtc: string;
  latitude: number;
  longitude: number;
  houseSystem: HouseSystem;
  ascendant: SignPlacement;
  midheaven: SignPlacement;
  houses: HouseCusp[];
  planets: PlanetPlacement[];
  aspects: ChartAspect[];
}

const RETROGRADE_STEP_DAYS = 1;

function isRetrograde(planet: PlanetKey, date: Date): boolean {
  if (!CAN_RETROGRADE.includes(planet)) return false;
  const before = new Date(date.getTime() - RETROGRADE_STEP_DAYS * 86400000);
  const after = new Date(date.getTime() + RETROGRADE_STEP_DAYS * 86400000);
  let lonBefore = eclipticLongitudeFor(planet, before);
  let lonAfter = eclipticLongitudeFor(planet, after);
  let delta = lonAfter - lonBefore;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta < 0;
}

export function computePlanetLongitudes(date: Date): Record<PlanetKey, number> {
  const result = {} as Record<PlanetKey, number>;
  for (const planet of PLANET_KEYS) {
    result[planet] = eclipticLongitudeFor(planet, date);
  }
  return result;
}

export function buildNatalChart(
  dateUtc: Date,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem = "whole-sign",
): NatalChart {
  const { ascendant, midheaven } = computeAngles(dateUtc, latitude, longitude);
  const houses = computeHouseCusps(ascendant, houseSystem);
  const longitudes = computePlanetLongitudes(dateUtc);

  const planets: PlanetPlacement[] = PLANET_KEYS.map((planet) => {
    const lon = longitudes[planet];
    const placement = placementForLongitude(lon);
    return {
      planet,
      ...placement,
      house: houseForLongitude(lon, houses),
      retrograde: isRetrograde(planet, dateUtc),
    };
  });

  const aspects: ChartAspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const found = findAspect(planets[i].longitude, planets[j].longitude);
      if (found) {
        aspects.push({ a: planets[i].planet, b: planets[j].planet, ...found });
      }
    }
  }
  aspects.sort((a, b) => a.exactOrb - b.exactOrb);

  return {
    dateUtc: dateUtc.toISOString(),
    latitude,
    longitude,
    houseSystem,
    ascendant: placementForLongitude(ascendant),
    midheaven: placementForLongitude(midheaven),
    houses,
    planets,
    aspects,
  };
}
