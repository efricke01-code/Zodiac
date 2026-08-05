export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;
export type Sign = (typeof SIGNS)[number];

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

export const SIGN_GLYPHS: Record<Sign, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

export const SIGN_ELEMENT: Record<Sign, "Fire" | "Earth" | "Air" | "Water"> = {
  Aries: "Fire", Leo: "Fire", Sagittarius: "Fire",
  Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth",
  Gemini: "Air", Libra: "Air", Aquarius: "Air",
  Cancer: "Water", Scorpio: "Water", Pisces: "Water",
};

export type HouseSystem = "whole-sign" | "equal";
export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";
export type MoonPhaseName = "new-moon" | "first-quarter" | "full-moon" | "last-quarter";

export interface SignPlacement {
  sign: Sign;
  degree: number;
  longitude: number;
}

export interface PlanetPlacement extends SignPlacement {
  planet: PlanetKey;
  house: number;
  retrograde: boolean;
}

export interface HouseCusp {
  house: number;
  cuspLongitude: number;
}

export interface ChartAspect {
  a: PlanetKey;
  b: PlanetKey;
  type: AspectType;
  nature: "harmonious" | "dynamic" | "neutral";
  orb: number;
  exactOrb: number;
  separation: number;
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

export interface BirthChartResponse {
  chart: NatalChart;
  timezone: string;
  place: string | null;
}

export interface GeocodeResult {
  displayName: string;
  latitude: number;
  longitude: number;
}

export interface TransitPlacement extends SignPlacement {
  planet: PlanetKey;
  house: number | null;
  retrograde: boolean;
}

export interface IngressEvent {
  type: "ingress";
  planet: PlanetKey;
  date: string;
  fromSign: Sign;
  toSign: Sign;
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
  phase: MoonPhaseName;
  date: string;
  sunSign: Sign;
  moonSign: Sign;
}

export interface UpcomingEventsResponse {
  from: string;
  days: number;
  ingresses: IngressEvent[];
  stations: StationEvent[];
  moonPhases: MoonPhaseEvent[];
}

export type HoroscopePeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface HoroscopeKeyTransit {
  transitingPlanet: PlanetKey;
  natalPlanet: PlanetKey;
  aspectType: AspectType;
  paragraph: string;
}

export interface HoroscopeResult {
  period: HoroscopePeriod;
  from: string;
  to: string;
  headline: string;
  keyTransits: HoroscopeKeyTransit[];
}

export interface SignMeta {
  sign: Sign;
  element: "Fire" | "Earth" | "Air" | "Water";
  modality: "Cardinal" | "Fixed" | "Mutable";
  ruler: string;
  keywords: string[];
  essence: string;
  shadow: string;
}

export interface HouseMeta {
  house: number;
  title: string;
  domain: string;
  keywords: string[];
  expression: string;
}

export interface PlanetMeta {
  planet: PlanetKey;
  title: string;
  represents: string;
  keyword: string;
  speed: "personal" | "social" | "generational";
}

export interface AspectMeta {
  type: AspectType;
  verb: string;
  description: string;
}

export interface AspectDef {
  type: AspectType;
  angle: number;
  orb: number;
  nature: "harmonious" | "dynamic" | "neutral";
}

export interface ElementMeta {
  title: string;
  signs: string[];
  description: string;
}

export interface ModalityMeta {
  title: string;
  signs: string[];
  description: string;
}

export interface ChartTerm {
  term: string;
  definition: string;
}

export interface ApiMeta {
  signs: Record<Sign, SignMeta>;
  houses: Record<number, HouseMeta>;
  planets: Record<PlanetKey, PlanetMeta>;
  aspects: Record<AspectType, AspectMeta>;
  aspectDefs: AspectDef[];
  elements: Record<"Fire" | "Earth" | "Air" | "Water", ElementMeta>;
  modalities: Record<"Cardinal" | "Fixed" | "Mutable", ModalityMeta>;
  chartTerms: ChartTerm[];
}

export interface BirthInput {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  place?: string;
  houseSystem?: HouseSystem;
}
