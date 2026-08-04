export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export interface AspectDef {
  type: AspectType;
  angle: number;
  orb: number;
  nature: "harmonious" | "dynamic" | "neutral";
}

export const ASPECT_DEFS: AspectDef[] = [
  { type: "conjunction", angle: 0, orb: 8, nature: "neutral" },
  { type: "sextile", angle: 60, orb: 4, nature: "harmonious" },
  { type: "square", angle: 90, orb: 6, nature: "dynamic" },
  { type: "trine", angle: 120, orb: 6, nature: "harmonious" },
  { type: "opposition", angle: 180, orb: 8, nature: "dynamic" },
];

export interface FoundAspect {
  type: AspectType;
  nature: AspectDef["nature"];
  orb: number; // signed difference from exact, degrees
  exactOrb: number; // absolute value of orb
  separation: number; // raw angular separation 0-180
}

function angularSeparation(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/** Returns the closest major aspect between two ecliptic longitudes, if any is within orb. */
export function findAspect(lonA: number, lonB: number): FoundAspect | null {
  const separation = angularSeparation(lonA, lonB);
  let best: FoundAspect | null = null;
  for (const def of ASPECT_DEFS) {
    const orb = separation - def.angle;
    const exactOrb = Math.abs(orb);
    if (exactOrb <= def.orb) {
      if (!best || exactOrb < best.exactOrb) {
        best = { type: def.type, nature: def.nature, orb, exactOrb, separation };
      }
    }
  }
  return best;
}
