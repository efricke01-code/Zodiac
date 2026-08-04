import { createRequire } from "module";
import type * as AstronomyTypes from "astronomy-engine";
import { CAN_RETROGRADE, PLANET_KEYS, PlanetKey, placementForLongitude, signIndexForLongitude } from "./constants.js";
import { eclipticLongitudeFor } from "./ephemeris.js";

const require = createRequire(import.meta.url);
const Astronomy = require("astronomy-engine") as typeof AstronomyTypes;

const DAY_MS = 86400000;

function bisectCrossing(
  planet: PlanetKey,
  lo: Date,
  hi: Date,
  crossed: (loLon: number, hiLon: number) => boolean,
): Date {
  let a = lo.getTime();
  let b = hi.getTime();
  for (let i = 0; i < 20; i++) {
    const mid = (a + b) / 2;
    const midLon = eclipticLongitudeFor(planet, new Date(mid));
    const loLon = eclipticLongitudeFor(planet, new Date(a));
    if (crossed(loLon, midLon)) {
      b = mid;
    } else {
      a = mid;
    }
  }
  return new Date((a + b) / 2);
}

export interface IngressEvent {
  type: "ingress";
  planet: PlanetKey;
  date: string;
  fromSign: string;
  toSign: string;
  retrograde: boolean;
}

export interface StationEvent {
  type: "station";
  planet: PlanetKey;
  date: string;
  direction: "retrograde" | "direct";
}

export interface MoonPhaseEvent {
  type: "moon-phase";
  phase: "new-moon" | "first-quarter" | "full-moon" | "last-quarter";
  date: string;
  sunSign: string;
  moonSign: string;
}

export type UpcomingEvent = IngressEvent | StationEvent | MoonPhaseEvent;

function planetsForScan(planets?: PlanetKey[]): PlanetKey[] {
  return planets ?? [...PLANET_KEYS];
}

export function findUpcomingIngresses(fromDate: Date, days: number, planets?: PlanetKey[]): IngressEvent[] {
  const events: IngressEvent[] = [];
  for (const planet of planetsForScan(planets)) {
    let prevDate = fromDate;
    let prevLon = eclipticLongitudeFor(planet, prevDate);
    let prevIndex = signIndexForLongitude(prevLon);
    for (let d = 1; d <= days; d++) {
      const curDate = new Date(fromDate.getTime() + d * DAY_MS);
      const curLon = eclipticLongitudeFor(planet, curDate);
      const curIndex = signIndexForLongitude(curLon);
      if (curIndex !== prevIndex) {
        const crossDate = bisectCrossing(planet, prevDate, curDate, (loLon, midLon) => {
          return signIndexForLongitude(midLon) !== prevIndex;
        });
        const before = eclipticLongitudeFor(planet, new Date(crossDate.getTime() - DAY_MS));
        const after = eclipticLongitudeFor(planet, new Date(crossDate.getTime() + DAY_MS));
        let delta = after - before;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        events.push({
          type: "ingress",
          planet,
          date: crossDate.toISOString(),
          fromSign: placementForLongitude(prevLon).sign,
          toSign: placementForLongitude(curLon).sign,
          retrograde: delta < 0,
        });
      }
      prevDate = curDate;
      prevLon = curLon;
      prevIndex = curIndex;
    }
  }
  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

export function findUpcomingStations(fromDate: Date, days: number, planets?: PlanetKey[]): StationEvent[] {
  const events: StationEvent[] = [];
  const scanPlanets = (planets ?? CAN_RETROGRADE).filter((p) => CAN_RETROGRADE.includes(p));
  for (const planet of scanPlanets) {
    let prevDate = fromDate;
    let prevDelta = eclipticLongitudeFor(planet, new Date(fromDate.getTime() + DAY_MS)) -
      eclipticLongitudeFor(planet, new Date(fromDate.getTime() - DAY_MS));
    if (prevDelta > 180) prevDelta -= 360;
    if (prevDelta < -180) prevDelta += 360;

    for (let d = 1; d <= days; d++) {
      const curDate = new Date(fromDate.getTime() + d * DAY_MS);
      let curDelta = eclipticLongitudeFor(planet, new Date(curDate.getTime() + DAY_MS)) -
        eclipticLongitudeFor(planet, new Date(curDate.getTime() - DAY_MS));
      if (curDelta > 180) curDelta -= 360;
      if (curDelta < -180) curDelta += 360;

      if ((prevDelta < 0) !== (curDelta < 0)) {
        let a = prevDate.getTime();
        let b = curDate.getTime();
        for (let i = 0; i < 20; i++) {
          const mid = (a + b) / 2;
          let midDelta = eclipticLongitudeFor(planet, new Date(mid + DAY_MS)) -
            eclipticLongitudeFor(planet, new Date(mid - DAY_MS));
          if (midDelta > 180) midDelta -= 360;
          if (midDelta < -180) midDelta += 360;
          if ((midDelta < 0) === (prevDelta < 0)) {
            a = mid;
          } else {
            b = mid;
          }
        }
        events.push({
          type: "station",
          planet,
          date: new Date((a + b) / 2).toISOString(),
          direction: curDelta < 0 ? "retrograde" : "direct",
        });
      }
      prevDate = curDate;
      prevDelta = curDelta;
    }
  }
  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

export function findUpcomingMoonPhases(fromDate: Date, count: number): MoonPhaseEvent[] {
  const events: MoonPhaseEvent[] = [];
  const names: MoonPhaseEvent["phase"][] = ["new-moon", "first-quarter", "full-moon", "last-quarter"];
  let quarter = Astronomy.SearchMoonQuarter(fromDate);
  for (let i = 0; i < count; i++) {
    const date = quarter.time.date;
    events.push({
      type: "moon-phase",
      phase: names[quarter.quarter],
      date: date.toISOString(),
      sunSign: placementForLongitude(eclipticLongitudeFor("Sun", date)).sign,
      moonSign: placementForLongitude(eclipticLongitudeFor("Moon", date)).sign,
    });
    quarter = Astronomy.NextMoonQuarter(quarter);
  }
  return events;
}
