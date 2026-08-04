import { PlanetKey } from "../astro/constants.js";

export interface PlanetMeta {
  planet: PlanetKey;
  title: string;
  represents: string; // "your core identity and sense of purpose"
  keyword: string; // one word, used in compact labels
  speed: "personal" | "social" | "generational";
}

export const PLANET_META: Record<PlanetKey, PlanetMeta> = {
  Sun: {
    planet: "Sun", title: "Sun", represents: "your core identity, ego, and sense of purpose",
    keyword: "identity", speed: "personal",
  },
  Moon: {
    planet: "Moon", title: "Moon", represents: "your emotional instincts, habits, and inner needs",
    keyword: "emotions", speed: "personal",
  },
  Mercury: {
    planet: "Mercury", title: "Mercury", represents: "how you think, process information, and communicate",
    keyword: "communication", speed: "personal",
  },
  Venus: {
    planet: "Venus", title: "Venus", represents: "how you love, relate, and find pleasure and beauty",
    keyword: "love & values", speed: "personal",
  },
  Mars: {
    planet: "Mars", title: "Mars", represents: "your drive, assertiveness, and how you take action",
    keyword: "drive", speed: "personal",
  },
  Jupiter: {
    planet: "Jupiter", title: "Jupiter", represents: "where you seek growth, meaning, and good fortune",
    keyword: "growth", speed: "social",
  },
  Saturn: {
    planet: "Saturn", title: "Saturn", represents: "where you meet structure, discipline, and long-term responsibility",
    keyword: "discipline", speed: "social",
  },
  Uranus: {
    planet: "Uranus", title: "Uranus", represents: "where you seek freedom, disruption, and sudden change",
    keyword: "change", speed: "generational",
  },
  Neptune: {
    planet: "Neptune", title: "Neptune", represents: "your imagination, ideals, and spiritual sensitivity",
    keyword: "imagination", speed: "generational",
  },
  Pluto: {
    planet: "Pluto", title: "Pluto", represents: "where you experience deep transformation and power dynamics",
    keyword: "transformation", speed: "generational",
  },
  NorthNode: {
    planet: "NorthNode", title: "North Node", represents: "the growth direction your life path is pulling you toward",
    keyword: "life path", speed: "generational",
  },
};
