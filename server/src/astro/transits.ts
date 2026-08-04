import { PLANET_KEYS, PlanetKey, placementForLongitude, SignPlacement } from "./constants.js";
import { eclipticLongitudeFor } from "./ephemeris.js";
import { houseForLongitude, HouseCusp } from "./houses.js";
import { findAspect, FoundAspect } from "./aspects.js";
import { NatalChart } from "./chart.js";

export interface TransitPlacement extends SignPlacement {
  planet: PlanetKey;
  house: number | null;
  retrograde: boolean;
}

function isRetrograde(planet: PlanetKey, date: Date): boolean {
  if (planet === "Sun" || planet === "Moon" || planet === "NorthNode") return false;
  const before = new Date(date.getTime() - 86400000);
  const after = new Date(date.getTime() + 86400000);
  let delta = eclipticLongitudeFor(planet, after) - eclipticLongitudeFor(planet, before);
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta < 0;
}

export function computeTransitPositions(date: Date, natalHouses?: HouseCusp[]): TransitPlacement[] {
  return PLANET_KEYS.map((planet) => {
    const lon = eclipticLongitudeFor(planet, date);
    const placement = placementForLongitude(lon);
    return {
      planet,
      ...placement,
      house: natalHouses ? houseForLongitude(lon, natalHouses) : null,
      retrograde: isRetrograde(planet, date),
    };
  });
}

export interface TransitToNatalAspect extends FoundAspect {
  transitingPlanet: PlanetKey;
  natalPlanet: PlanetKey;
}

export function computeTransitsToNatal(natal: NatalChart, date: Date): TransitToNatalAspect[] {
  const transiting = computeTransitPositions(date);
  const results: TransitToNatalAspect[] = [];
  for (const t of transiting) {
    for (const n of natal.planets) {
      const found = findAspect(t.longitude, n.longitude);
      if (found) {
        results.push({ transitingPlanet: t.planet, natalPlanet: n.planet, ...found });
      }
    }
  }
  results.sort((a, b) => a.exactOrb - b.exactOrb);
  return results;
}
