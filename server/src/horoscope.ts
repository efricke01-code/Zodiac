import { PlanetKey, placementForLongitude } from "./astro/constants.js";
import { NatalChart } from "./astro/chart.js";
import { computeTransitPositions, computeTransitsToNatal, TransitToNatalAspect } from "./astro/transits.js";
import { transitToNatalParagraph } from "./content/templates.js";
import { PLANET_META } from "./content/planets.js";
import { SIGN_META } from "./content/signs.js";

export type HoroscopePeriod = "daily" | "weekly" | "monthly" | "yearly";

interface PeriodConfig {
  windowDays: number;
  sampleStepDays: number;
  allowedTransiters: PlanetKey[];
  topN: number;
}

const ALL_PLANETS: PlanetKey[] = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
  "Uranus", "Neptune", "Pluto", "NorthNode",
];

const PERIOD_CONFIG: Record<HoroscopePeriod, PeriodConfig> = {
  daily: { windowDays: 1, sampleStepDays: 1, allowedTransiters: ALL_PLANETS, topN: 3 },
  weekly: { windowDays: 7, sampleStepDays: 1, allowedTransiters: ALL_PLANETS, topN: 4 },
  monthly: {
    windowDays: 30, sampleStepDays: 2,
    allowedTransiters: ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "NorthNode"],
    topN: 5,
  },
  yearly: {
    windowDays: 365, sampleStepDays: 5,
    allowedTransiters: ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "NorthNode"],
    topN: 6,
  },
};

interface CollectedAspect extends TransitToNatalAspect {
  sampleDate: string;
}

function collectSignificantTransits(
  natal: NatalChart,
  fromDate: Date,
  config: PeriodConfig,
): CollectedAspect[] {
  const best = new Map<string, CollectedAspect>();
  const steps = Math.max(1, Math.ceil(config.windowDays / config.sampleStepDays));

  for (let i = 0; i <= steps; i++) {
    const sampleDate = new Date(fromDate.getTime() + i * config.sampleStepDays * 86400000);
    const aspects = computeTransitsToNatal(natal, sampleDate);
    for (const asp of aspects) {
      if (!config.allowedTransiters.includes(asp.transitingPlanet)) continue;
      const key = `${asp.transitingPlanet}-${asp.natalPlanet}-${asp.type}`;
      const existing = best.get(key);
      if (!existing || asp.exactOrb < existing.exactOrb) {
        best.set(key, { ...asp, sampleDate: sampleDate.toISOString() });
      }
    }
  }

  return Array.from(best.values()).sort((a, b) => a.exactOrb - b.exactOrb);
}

export interface HoroscopeKeyTransit {
  transitingPlanet: PlanetKey;
  natalPlanet: PlanetKey;
  aspectType: string;
  paragraph: string;
}

export interface HoroscopeResult {
  period: HoroscopePeriod;
  from: string;
  to: string;
  headline: string;
  keyTransits: HoroscopeKeyTransit[];
}

export function generateHoroscope(natal: NatalChart, period: HoroscopePeriod, fromDate: Date): HoroscopeResult {
  const config = PERIOD_CONFIG[period];
  const toDate = new Date(fromDate.getTime() + config.windowDays * 86400000);

  const collected = collectSignificantTransits(natal, fromDate, config).slice(0, config.topN);

  const keyTransits: HoroscopeKeyTransit[] = collected.map((asp) => {
    const transitLon = placementForLongitude(
      computeTransitPositions(new Date(asp.sampleDate)).find((p) => p.planet === asp.transitingPlanet)!.longitude,
    );
    const natalPlanet = natal.planets.find((p) => p.planet === asp.natalPlanet)!;
    return {
      transitingPlanet: asp.transitingPlanet,
      natalPlanet: asp.natalPlanet,
      aspectType: asp.type,
      paragraph: transitToNatalParagraph(
        asp.transitingPlanet,
        transitLon.sign,
        asp.type,
        asp.natalPlanet,
        natalPlanet.sign,
        natalPlanet.house,
      ),
    };
  });

  const moonNow = computeTransitPositions(fromDate).find((p) => p.planet === "Moon")!;
  const sunNow = computeTransitPositions(fromDate).find((p) => p.planet === "Sun")!;

  const headlineByPeriod: Record<HoroscopePeriod, string> = {
    daily: `Today the Moon is in ${moonNow.sign}, setting an emotional tone of ${SIGN_META[moonNow.sign].keywords[0]} for the day, while the Sun moves through ${sunNow.sign}.`,
    weekly: `This week's sky is anchored by the Sun in ${sunNow.sign} and a Moon that will move through several signs, but the aspects below are what matter most for you personally.`,
    monthly: `This month, the personal planets and the Sun in ${sunNow.sign} are making the aspects below to your natal chart — these are the themes worth tracking over the coming weeks.`,
    yearly: `Looking out across the year ahead, it's the slow-moving outer planets — Jupiter, Saturn, Uranus, Neptune, and Pluto — that shape the big story arcs below.`,
  };

  return {
    period,
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    headline: headlineByPeriod[period],
    keyTransits,
  };
}
