import { PlanetKey, Sign } from "../astro/constants.js";
import { AspectType } from "../astro/aspects.js";
import { SIGN_META } from "./signs.js";
import { HOUSE_META } from "./houses.js";
import { PLANET_META } from "./planets.js";
import { ASPECT_META } from "./aspectMeta.js";

/** "1st", "2nd", "3rd", "4th", ... "12th" */
function ordinal(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

/** Paragraph describing a single natal placement: a planet, in a sign, in a house. */
export function planetSignHouseParagraph(
  planet: PlanetKey,
  sign: Sign,
  house: number,
  retrograde: boolean,
): string {
  const p = PLANET_META[planet];
  const s = SIGN_META[sign];
  const h = HOUSE_META[house];
  const retroClause = retrograde
    ? ` It's retrograde here, so this energy tends to work inward first — more reflection and revisiting than outward action.`
    : "";
  return (
    `${p.title} governs ${p.represents}. In ${sign}, that tends to come out as ${s.essence}. ` +
    `Landing in your ${ordinal(house)} House, that same energy plays out through ${h.expression} — so expect ` +
    `${s.keywords[0]} and ${s.keywords[1]} to color that part of your life. ` +
    `The growth edge to watch for is ${s.shadow}.${retroClause}`
  );
}

/** Generic paragraph for the "pick a sign + a house" explorer tool. */
export function signHouseParagraph(sign: Sign, house: number): string {
  const s = SIGN_META[sign];
  const h = HOUSE_META[house];
  return (
    `${sign} is ${s.essence}. In your ${ordinal(house)} House, that comes out through ${h.expression}, ` +
    `most often through ${s.keywords[0]} and ${s.keywords[1]}. The growth edge to watch for is ${s.shadow}. ` +
    `Ruled by ${s.ruler}, this placement channels ${s.ruler}'s themes into that part of your life.`
  );
}

/** Generic paragraph for the "pick a planet + a sign" explorer tool (no house involved). */
export function planetSignParagraph(planet: PlanetKey, sign: Sign): string {
  const p = PLANET_META[planet];
  const s = SIGN_META[sign];
  const inDomicile = p.title === s.ruler;
  const domicileClause = inDomicile
    ? ` This is what astrologers call a "domicile" placement — ${sign} is ${p.title}'s own home sign, so this energy tends to express itself clearly, comfortably, and with real strength.`
    : "";
  return (
    `${p.title} governs ${p.represents}. In ${sign}, that comes out as ${s.essence} — ` +
    `expect ${s.keywords[0]} and ${s.keywords[1]} to color how it shows up, tempered by a pull toward ${s.shadow}.` +
    `${domicileClause} Ruled by ${s.ruler}, ${sign} filters ${p.title}'s themes of ${p.keyword} through a ${s.element.toLowerCase()}, ${s.modality.toLowerCase()} lens.`
  );
}

/** Paragraph describing the natal Ascendant (Rising Sign). */
export function ascendantParagraph(sign: Sign): string {
  const s = SIGN_META[sign];
  return (
    `Your Ascendant is in ${sign} — this is commonly known as your "Rising Sign," and it's one of the ` +
    `most important placements in a chart, often ranked right alongside your Sun and Moon signs. ` +
    `While your Sun describes your core identity, your Ascendant describes your outward style: the ` +
    `first impression you give, your instinctive reactions, and even your physical demeanor — the ` +
    `"mask" you meet the world with. ${sign} rising tends to come across as ${s.essence}, ` +
    `leaning on ${s.keywords[0]} and ${s.keywords[1]} — though the shadow side to watch for is ${s.shadow}. ` +
    `Ruled by ${s.ruler}, this sign also marks the start of your House 1, the House of Self.`
  );
}

/** Paragraph describing the natal Midheaven (MC). */
export function midheavenParagraph(sign: Sign): string {
  const s = SIGN_META[sign];
  return (
    `Your Midheaven is in ${sign} — often shortened to "MC." It's the highest point of the chart, ` +
    `associated with your career, public reputation, and the direction your life is heading — the ` +
    `image you build for the wider world, as opposed to your private inner life. A ${sign} Midheaven ` +
    `tends to seek recognition through ${s.keywords[0]} and ${s.keywords[1]}, while the growth edge ` +
    `to watch for professionally is ${s.shadow}. Ruled by ${s.ruler}, this sign also marks the start ` +
    `of your House 10, the House of Vocation.`
  );
}

/** Paragraph explaining a transiting planet aspecting a natal planet. */
export function transitToNatalParagraph(
  transitingPlanet: PlanetKey,
  transitSign: Sign,
  aspect: AspectType,
  natalPlanet: PlanetKey,
  natalSign: Sign,
  natalHouse: number,
): string {
  const t = PLANET_META[transitingPlanet];
  const n = PLANET_META[natalPlanet];
  const a = ASPECT_META[aspect];
  const h = HOUSE_META[natalHouse];
  return (
    `Transiting ${t.title} in ${transitSign} ${a.verb} your natal ${n.title} in ${natalSign} — ${a.description}. ` +
    `Because your ${n.title} sits in your ${ordinal(natalHouse)} House, expect this to be most noticeable around ${h.expression}. ` +
    `In practice, this is a window to pay attention to ${n.represents}, filtered through ${t.title}'s theme of ${t.keyword}.`
  );
}

const INGRESS_DURATION: Record<PlanetKey, string> = {
  Sun: "about a month",
  Moon: "about two and a half days",
  Mercury: "a few weeks (longer if it turns retrograde while there)",
  Venus: "three to four weeks (longer if it turns retrograde while there)",
  Mars: "about six to seven weeks",
  Jupiter: "about a year",
  Saturn: "about two and a half years",
  Uranus: "about seven years",
  Neptune: "about fourteen years",
  Pluto: "roughly twenty years",
  NorthNode: "about a year and a half",
};

/** Paragraph for the "Venus is moving into Libra — what does that mean for a Gemini Sun?" tool. */
export function ingressForSignParagraph(
  planet: PlanetKey,
  toSign: Sign,
  natalSign: Sign,
  natalPlanet: PlanetKey = "Sun",
): string {
  const t = PLANET_META[planet];
  const s = SIGN_META[toSign];
  const ns = SIGN_META[natalSign];
  const np = PLANET_META[natalPlanet];
  const duration = INGRESS_DURATION[planet];

  const sameElement = s.element === ns.element;
  const relation = sameElement
    ? `Because ${toSign} and your ${natalSign} ${np.title} share the ${s.element} element, this transit should feel natural and easy to work with`
    : `Because ${toSign} is ${s.element} and your ${natalSign} ${np.title} is ${ns.element}, this transit may ask your ${np.title} to stretch a little outside its comfort zone`;

  const focus = np.title === "Sun" ? "your sense of identity and purpose" : np.represents;

  return (
    `${t.title} is moving into ${toSign}, where it will stay for ${duration}, bringing themes of ` +
    `${s.keywords[0]} and ${s.keywords[1]} to ${t.represents}. ` +
    `For someone with their ${np.title} in ${natalSign} — ${ns.essence} — ${relation}. ` +
    `A bit of advice: use this transit to lean into ${s.keywords[0]} around ${focus}, while staying mindful of ` +
    `${toSign}'s pull toward ${s.shadow}${sameElement ? "" : `, since it isn't naturally ${ns.element.toLowerCase()} like your ${natalSign} ${np.title}`}.`
  );
}

/** Paragraph for the "full moon in Leo — what does this mean for a Taurus Sun?" tool. */
export function moonEventForSignParagraph(
  phase: "new-moon" | "first-quarter" | "full-moon" | "last-quarter",
  eventSign: Sign,
  natalSign: Sign,
  natalPlanet: PlanetKey = "Sun",
): string {
  const es = SIGN_META[eventSign];
  const ns = SIGN_META[natalSign];
  const p = PLANET_META[natalPlanet];
  const phaseLabel: Record<typeof phase, string> = {
    "new-moon": "New Moon",
    "first-quarter": "First Quarter Moon",
    "full-moon": "Full Moon",
    "last-quarter": "Last Quarter Moon",
  } as const;
  const phaseMeaning: Record<typeof phase, string> = {
    "new-moon": "a fresh-start energy, good for setting intentions and beginning something new",
    "first-quarter": "a moment of decision and momentum, where friction pushes you to act",
    "full-moon": "a moment of culmination, visibility, and emotional intensity, where things come to a head or come to light",
    "last-quarter": "a moment of release, where you let go of what no longer serves you before the next cycle begins",
  } as const;

  const sameElement = es.element === ns.element;
  const relation = sameElement
    ? `Because ${eventSign} and ${natalSign} share the ${es.element} element, this lunation should feel supportive and easy to work with`
    : `Because ${eventSign} is ${es.element} and your ${natalSign} ${p.title} is ${ns.element}, this lunation may feel like it is asking your ${p.title} to stretch a little outside its comfort zone`;

  return (
    `The ${phaseLabel[phase]} in ${eventSign} brings ${phaseMeaning[phase]}, colored by ${eventSign}'s themes of ${es.keywords[0]} and ${es.keywords[1]}. ` +
    `For someone with their ${p.title} in ${natalSign} — ${ns.essence} — ${relation}. ` +
    `A good use of this lunation: apply its ${es.keywords[0]} energy to ${p.title === "Sun" ? "your sense of identity and purpose" : p.represents}, ` +
    `while staying mindful of ${natalSign}'s tendency toward ${ns.shadow}.`
  );
}
