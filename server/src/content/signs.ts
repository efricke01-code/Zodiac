import { Sign } from "../astro/constants.js";

export interface SignMeta {
  sign: Sign;
  element: "Fire" | "Earth" | "Air" | "Water";
  modality: "Cardinal" | "Fixed" | "Mutable";
  ruler: string;
  keywords: string[];
  essence: string; // short phrase: "bold, self-starting energy"
  shadow: string; // short phrase: the sign's growth edge
}

export const SIGN_META: Record<Sign, SignMeta> = {
  Aries: {
    sign: "Aries", element: "Fire", modality: "Cardinal", ruler: "Mars",
    keywords: ["initiative", "courage", "impulsiveness", "competitiveness"],
    essence: "bold, self-starting, and quick to act on instinct",
    shadow: "impatience and a tendency to leap before looking",
  },
  Taurus: {
    sign: "Taurus", element: "Earth", modality: "Fixed", ruler: "Venus",
    keywords: ["stability", "sensuality", "patience", "stubbornness"],
    essence: "steady, grounded, and drawn to comfort and pleasure",
    shadow: "resistance to change and a stubborn dig-in-your-heels streak",
  },
  Gemini: {
    sign: "Gemini", element: "Air", modality: "Mutable", ruler: "Mercury",
    keywords: ["curiosity", "communication", "adaptability", "restlessness"],
    essence: "curious, quick-witted, and endlessly communicative",
    shadow: "scattered focus and a restless need for constant novelty",
  },
  Cancer: {
    sign: "Cancer", element: "Water", modality: "Cardinal", ruler: "Moon",
    keywords: ["nurturing", "sensitivity", "protectiveness", "moodiness"],
    essence: "nurturing, intuitive, and deeply attuned to emotional undercurrents",
    shadow: "over-protectiveness and a tendency to retreat into the shell",
  },
  Leo: {
    sign: "Leo", element: "Fire", modality: "Fixed", ruler: "Sun",
    keywords: ["confidence", "creativity", "generosity", "pride"],
    essence: "warm, expressive, and driven to create and be seen",
    shadow: "neediness for validation that can tip into pride or drama",
  },
  Virgo: {
    sign: "Virgo", element: "Earth", modality: "Mutable", ruler: "Mercury",
    keywords: ["precision", "service", "analysis", "perfectionism"],
    essence: "precise, practical, and quietly devoted to improvement",
    shadow: "perfectionism and self-critical overthinking",
  },
  Libra: {
    sign: "Libra", element: "Air", modality: "Cardinal", ruler: "Venus",
    keywords: ["balance", "harmony", "partnership", "indecision"],
    essence: "diplomatic, relationship-oriented, and tuned to fairness and beauty",
    shadow: "people-pleasing and difficulty committing to a hard choice",
  },
  Scorpio: {
    sign: "Scorpio", element: "Water", modality: "Fixed", ruler: "Pluto",
    keywords: ["intensity", "transformation", "depth", "control"],
    essence: "intense, perceptive, and unafraid of what lies beneath the surface",
    shadow: "guardedness around control and difficulty trusting others",
  },
  Sagittarius: {
    sign: "Sagittarius", element: "Fire", modality: "Mutable", ruler: "Jupiter",
    keywords: ["optimism", "exploration", "philosophy", "bluntness"],
    essence: "optimistic, freedom-loving, and hungry for meaning and horizons",
    shadow: "restlessness and a bluntness that can overlook others' feelings",
  },
  Capricorn: {
    sign: "Capricorn", element: "Earth", modality: "Cardinal", ruler: "Saturn",
    keywords: ["ambition", "discipline", "responsibility", "reserve"],
    essence: "disciplined, ambitious, and focused on building something lasting",
    shadow: "guardedness that can shade into workaholism or emotional distance",
  },
  Aquarius: {
    sign: "Aquarius", element: "Air", modality: "Fixed", ruler: "Uranus",
    keywords: ["individuality", "innovation", "idealism", "detachment"],
    essence: "independent, forward-thinking, and invested in the collective",
    shadow: "emotional detachment and a stubborn insistence on being different",
  },
  Pisces: {
    sign: "Pisces", element: "Water", modality: "Mutable", ruler: "Neptune",
    keywords: ["imagination", "empathy", "spirituality", "escapism"],
    essence: "dreamy, compassionate, and porous to the moods around you",
    shadow: "escapism and blurry boundaries",
  },
};
