import { PlanetKey, Sign } from "../astro/constants.js";
import { AspectType } from "../astro/aspects.js";
import { SIGN_META } from "./signs.js";
import { HOUSE_META } from "./houses.js";
import { PLANET_META } from "./planets.js";
import { ASPECT_META } from "./aspectMeta.js";

function article(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
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
    ? ` It is retrograde here, so this energy tends to work first through reflection and revision, turning inward before it shows up outwardly.`
    : "";
  return (
    `${p.title} represents ${p.represents}. Placed in ${sign}, it takes on ${article(s.essence)} ${s.essence} quality, ` +
    `for better (${s.keywords.slice(0, 2).join(" and ")}) and for worse (${s.shadow}). ` +
    `Sitting in your ${h.title.replace("House of ", "")} (House ${house}), this plays out most strongly around ${h.domain}.${retroClause}`
  );
}

/** Generic paragraph for the "pick a sign + a house" explorer tool. */
export function signHouseParagraph(sign: Sign, house: number): string {
  const s = SIGN_META[sign];
  const h = HOUSE_META[house];
  return (
    `${sign} energy is ${s.essence}. Expressed through the ${h.title} (House ${house}), which governs ${h.domain}, ` +
    `this shows up as a ${s.element.toLowerCase()}-toned, ${s.modality.toLowerCase()} approach to ${h.keywords.join(", ")}. ` +
    `You likely bring ${s.keywords[0]} and ${s.keywords[1]} to this part of life, while the growth edge to watch for is ${s.shadow}. ` +
    `Ruled by ${s.ruler}, this placement asks you to let ${s.ruler}'s themes color how you handle ${h.keywords[0]}.`
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
    `${p.title} represents ${p.represents}. Placed in ${sign}, it takes on ${article(s.essence)} ${s.essence} quality: ` +
    `expect themes of ${s.keywords.slice(0, 2).join(" and ")} to color how it shows up, tempered by ${sign}'s pull toward ${s.shadow}.` +
    `${domicileClause} Ruled by ${s.ruler}, ${sign} filters ${p.title}'s themes of ${p.keyword} through a ${s.element.toLowerCase()}, ${s.modality.toLowerCase()} lens.`
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
    `Because your ${n.title} sits in your ${h.title} (House ${natalHouse}), expect this to be most noticeable around ${h.domain}. ` +
    `In practice, this is a window to pay attention to ${n.represents}, filtered through ${t.title}'s theme of ${t.keyword}.`
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
    `The ${phaseLabel[phase]} in ${eventSign} brings ${phaseMeaning[phase]}, colored by ${eventSign}'s themes of ${es.keywords.slice(0, 2).join(" and ")}. ` +
    `For someone with their ${p.title} in ${natalSign} — ${ns.essence} — ${relation}. ` +
    `A good use of this lunation: apply its ${es.keywords[0]} energy to ${p.title === "Sun" ? "your sense of identity and purpose" : p.represents}, ` +
    `while staying mindful of ${natalSign}'s tendency toward ${ns.shadow}.`
  );
}
