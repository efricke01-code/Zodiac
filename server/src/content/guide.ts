export interface ElementDef {
  title: string;
  signs: string[];
  description: string;
}

export const ELEMENT_META: Record<"Fire" | "Earth" | "Air" | "Water", ElementDef> = {
  Fire: {
    title: "Fire",
    signs: ["Aries", "Leo", "Sagittarius"],
    description:
      "Fire signs are associated with energy, passion, and action. They tend to be spontaneous, " +
      "confident, and driven by instinct rather than overthinking.",
  },
  Earth: {
    title: "Earth",
    signs: ["Taurus", "Virgo", "Capricorn"],
    description:
      "Earth signs are associated with the physical, tangible world. They tend to be practical, " +
      "grounded, and focused on stability and results.",
  },
  Air: {
    title: "Air",
    signs: ["Gemini", "Libra", "Aquarius"],
    description:
      "Air signs are associated with intellect, communication, and ideas. They tend to be " +
      "thoughtful, social, and focused on connecting people and information.",
  },
  Water: {
    title: "Water",
    signs: ["Cancer", "Scorpio", "Pisces"],
    description:
      "Water signs are associated with emotion, intuition, and depth. They tend to be sensitive, " +
      "empathetic, and attuned to unspoken feelings.",
  },
};

export interface ModalityDef {
  title: string;
  signs: string[];
  description: string;
}

export const MODALITY_META: Record<"Cardinal" | "Fixed" | "Mutable", ModalityDef> = {
  Cardinal: {
    title: "Cardinal",
    signs: ["Aries", "Cancer", "Libra", "Capricorn"],
    description:
      "Cardinal signs begin each season and are natural initiators — good at starting things, " +
      "taking charge, and setting new directions.",
  },
  Fixed: {
    title: "Fixed",
    signs: ["Taurus", "Leo", "Scorpio", "Aquarius"],
    description:
      "Fixed signs fall in the middle of each season and are natural stabilizers — good at " +
      "sustaining effort, seeing things through, and holding steady once committed.",
  },
  Mutable: {
    title: "Mutable",
    signs: ["Gemini", "Virgo", "Sagittarius", "Pisces"],
    description:
      "Mutable signs end each season and are natural adapters — good at adjusting to change, " +
      "transitioning between phases, and staying flexible.",
  },
};

export interface ChartTerm {
  term: string;
  definition: string;
}

export const CHART_TERMS: ChartTerm[] = [
  {
    term: "Natal Chart",
    definition:
      "A snapshot of exactly where the Sun, Moon, and planets were in the sky at the moment and " +
      "place you were born. It's the foundation everything else in this app — horoscopes, transits, " +
      "explorers — is compared against.",
  },
  {
    term: "The Big Three",
    definition:
      "Shorthand for your Sun sign (core identity), Moon sign (emotional inner world), and Rising " +
      "sign (outward style) — often considered the three most important placements to learn first.",
  },
  {
    term: "Ascendant (Rising Sign)",
    definition:
      "The zodiac sign that was rising on the eastern horizon at the exact moment of your birth. " +
      "It's considered the 'mask' you show the world — your first impression, instincts, and outward " +
      "style. It also marks the start of House 1, which is why it's sometimes just called 'the 1st House cusp.'",
  },
  {
    term: "Descendant",
    definition:
      "The point directly opposite the Ascendant, marking the start of House 7. It's associated with " +
      "partnerships — marriage, close collaborators, and even open rivals.",
  },
  {
    term: "Midheaven (MC)",
    definition:
      "The highest point of the chart, marking the start of House 10. It's associated with career, " +
      "public reputation, and the direction your life is heading.",
  },
  {
    term: "Imum Coeli (IC)",
    definition:
      "The point directly opposite the Midheaven, marking the start of House 4. It's associated with " +
      "home, family, and your private inner life — the opposite of the public-facing Midheaven.",
  },
  {
    term: "House",
    definition:
      "One of twelve divisions of the chart, each representing a different area of life (home, " +
      "career, relationships, and so on). A planet's house shows where in life its energy tends to " +
      "play out, while its sign shows how that energy behaves.",
  },
  {
    term: "House System",
    definition:
      "The method used to divide the chart into houses. This app defaults to Whole Sign — the " +
      "oldest and simplest system, where each house is exactly one zodiac sign — with Equal House " +
      "available as an alternative.",
  },
  {
    term: "Retrograde",
    definition:
      "When a planet appears to move backward through the zodiac from Earth's point of view — an " +
      "optical illusion of relative orbital speed, not an actual reversal. Traditionally read as a " +
      "time to revisit, review, or turn inward regarding that planet's themes.",
  },
  {
    term: "Transit",
    definition:
      "The real-time, ongoing movement of the planets, compared against your unchanging natal chart. " +
      "Transits are what horoscopes are based on: today's sky interacting with your birth sky.",
  },
  {
    term: "Aspect",
    definition:
      "The angular relationship between two points in a chart, like two planets. Certain angles are " +
      "considered especially significant — see the Aspects section below for what each one means.",
  },
  {
    term: "Orb",
    definition:
      "The allowed margin of error, in degrees, for an aspect to still 'count.' A closer angle (a " +
      "tighter orb) is considered a stronger, more exact expression of that aspect.",
  },
];
