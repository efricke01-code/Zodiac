import { useMemo } from "react";
import type { NatalChart, PlanetPlacement, Sign } from "../api/types";
import { PLANET_GLYPHS, SIGN_GLYPHS, SIGN_ELEMENT, SIGNS } from "../api/types";

const SIZE = 620;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_OUTER = 260;
const R_SIGN_INNER = 220;
const R_HOUSE_INNER = 205;
const R_PLANET_BASE = 175;
const R_PLANET_BAND_STEP = 22;
const R_ASPECT = 95;

const ELEMENT_COLOR: Record<"Fire" | "Earth" | "Air" | "Water", string> = {
  Fire: "var(--wedge-fire)",
  Earth: "var(--wedge-earth)",
  Air: "var(--wedge-air)",
  Water: "var(--wedge-water)",
};

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function normalize(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/** Maps an ecliptic longitude to a screen angle (degrees, standard math convention)
 * such that the Ascendant sits at the 9-o'clock position and the zodiac runs
 * counter-clockwise, matching the conventional chart wheel layout. */
function screenAngle(longitude: number, ascendantLongitude: number): number {
  return normalize(180 + (longitude - ascendantLongitude));
}

function point(radius: number, angleDeg: number): [number, number] {
  const rad = toRad(angleDeg);
  return [CX + radius * Math.cos(rad), CY - radius * Math.sin(rad)];
}

function arcPath(rOuter: number, rInner: number, angleStart: number, angleEnd: number): string {
  // angleStart/angleEnd in screen-angle degrees; SVG arcs sweep clockwise as angle *decreases*
  // in our convention, so we go from the larger to the smaller angle for a clockwise-on-screen sweep.
  const [x1, y1] = point(rOuter, angleStart);
  const [x2, y2] = point(rOuter, angleEnd);
  const [x3, y3] = point(rInner, angleEnd);
  const [x4, y4] = point(rInner, angleStart);
  const large = 0; // wedges are always 30 degrees, well under 180
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${large} 0 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${large} 1 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

interface PlacedPlanet extends PlanetPlacement {
  band: number;
}

function assignBands(planets: PlanetPlacement[]): PlacedPlanet[] {
  const sorted = [...planets].sort((a, b) => a.longitude - b.longitude);
  const placed: PlacedPlanet[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];
    let band = 0;
    if (i > 0) {
      const prev = sorted[i - 1];
      const gap = normalize(cur.longitude - prev.longitude);
      const prevBand = placed[i - 1].band;
      band = gap < 7 ? (prevBand + 1) % 3 : 0;
    }
    placed.push({ ...cur, band });
  }
  return placed;
}

const ASPECT_COLOR: Record<string, string> = {
  trine: "var(--aspect-harmonious)",
  sextile: "var(--aspect-harmonious)",
  square: "var(--aspect-dynamic)",
  opposition: "var(--aspect-dynamic)",
  conjunction: "var(--aspect-neutral)",
};

export function ChartWheel({ chart }: { chart: NatalChart }) {
  const asc = chart.ascendant.longitude;
  const placedPlanets = useMemo(() => assignBands(chart.planets), [chart.planets]);

  const signWedges = SIGNS.map((sign, i) => {
    const start = screenAngle(i * 30, asc);
    const end = screenAngle(i * 30 + 30, asc);
    const mid = screenAngle(i * 30 + 15, asc);
    const [lx, ly] = point((R_OUTER + R_SIGN_INNER) / 2, mid);
    return { sign, start, end, mid, lx, ly };
  });

  return (
    <svg
      className="chart-wheel"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label="Natal chart wheel showing zodiac signs, houses, and planetary placements"
    >
      <circle cx={CX} cy={CY} r={R_OUTER} className="wheel-ring" />
      <circle cx={CX} cy={CY} r={R_SIGN_INNER} className="wheel-ring" />
      <circle cx={CX} cy={CY} r={R_HOUSE_INNER} className="wheel-ring" />
      <circle cx={CX} cy={CY} r={R_ASPECT} className="wheel-ring wheel-ring--faint" />

      {/* Sign wedges */}
      {signWedges.map(({ sign, start, end, lx, ly }) => (
        <g key={sign}>
          <path d={arcPath(R_OUTER, R_SIGN_INNER, start, end)} fill={ELEMENT_COLOR[SIGN_ELEMENT[sign]]} className="sign-wedge">
            <title>{sign} ({SIGN_ELEMENT[sign]})</title>
          </path>
          <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" className="sign-glyph">
            {SIGN_GLYPHS[sign]}
          </text>
        </g>
      ))}

      {/* House cusp lines + numbers */}
      {chart.houses.map((h) => {
        const angle = screenAngle(h.cuspLongitude, asc);
        const [ox, oy] = point(R_HOUSE_INNER, angle);
        const [ix, iy] = point(R_ASPECT, angle);
        const nextCusp = chart.houses[h.house % 12].cuspLongitude;
        const midAngle = screenAngle(normalize(h.cuspLongitude + normalize(nextCusp - h.cuspLongitude) / 2), asc);
        const [nx, ny] = point(R_HOUSE_INNER - 16, midAngle);
        const isAngle = h.house === 1 || h.house === 4 || h.house === 7 || h.house === 10;
        return (
          <g key={h.house}>
            <line x1={ix} y1={iy} x2={ox} y2={oy} className={isAngle ? "house-line house-line--angle" : "house-line"} />
            <text x={nx} y={ny} textAnchor="middle" dominantBaseline="central" className="house-number">
              {h.house}
            </text>
          </g>
        );
      })}

      {/* Angle labels: ASC / DSC / MC / IC */}
      {([
        ["ASC", chart.ascendant.longitude],
        ["DSC", normalize(chart.ascendant.longitude + 180)],
        ["MC", chart.midheaven.longitude],
        ["IC", normalize(chart.midheaven.longitude + 180)],
      ] as const).map(([label, lon]) => {
        const angle = screenAngle(lon, asc);
        const [x, y] = point(R_OUTER + 18, angle);
        return (
          <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="central" className="angle-label">
            {label}
          </text>
        );
      })}

      {/* Aspect lines */}
      {chart.aspects.map((asp, i) => {
        const pA = chart.planets.find((p) => p.planet === asp.a)!;
        const pB = chart.planets.find((p) => p.planet === asp.b)!;
        const angleA = screenAngle(pA.longitude, asc);
        const angleB = screenAngle(pB.longitude, asc);
        const [x1, y1] = point(R_ASPECT, angleA);
        const [x2, y2] = point(R_ASPECT, angleB);
        return (
          <line
            key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={ASPECT_COLOR[asp.type]} className="aspect-line"
          >
            <title>{asp.a} {asp.type} {asp.b} (orb {asp.orb.toFixed(1)}°)</title>
          </line>
        );
      })}

      {/* Planet glyphs */}
      {placedPlanets.map((p) => {
        const angle = screenAngle(p.longitude, asc);
        const radius = R_PLANET_BASE - p.band * R_PLANET_BAND_STEP;
        const [x, y] = point(radius, angle);
        const [tx, ty] = point(R_HOUSE_INNER - 2, angle);
        return (
          <g key={p.planet}>
            <line x1={tx} y1={ty} x2={x} y2={y} className="planet-tick" />
            <circle cx={x} cy={y} r={14} className="planet-badge" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="planet-glyph">
              {PLANET_GLYPHS[p.planet]}
              {p.retrograde && <tspan className="retrograde-mark">℞</tspan>}
            </text>
            <title>
              {p.planet} in {p.sign} {p.degree.toFixed(1)}° · House {p.house}{p.retrograde ? " · Retrograde" : ""}
            </title>
          </g>
        );
      })}
    </svg>
  );
}

export function ChartWheelLegend() {
  return (
    <div className="wheel-legend">
      <div className="legend-group">
        <span className="legend-title">Elements</span>
        {(["Fire", "Earth", "Air", "Water"] as const).map((el) => (
          <span key={el} className="legend-item">
            <span className="legend-swatch" style={{ background: ELEMENT_COLOR[el] }} />
            {el}
          </span>
        ))}
      </div>
      <div className="legend-group">
        <span className="legend-title">Aspects</span>
        <span className="legend-item"><span className="legend-swatch" style={{ background: "var(--aspect-harmonious)" }} /> Harmonious (trine, sextile)</span>
        <span className="legend-item"><span className="legend-swatch" style={{ background: "var(--aspect-dynamic)" }} /> Dynamic (square, opposition)</span>
        <span className="legend-item"><span className="legend-swatch" style={{ background: "var(--aspect-neutral)" }} /> Conjunction</span>
      </div>
    </div>
  );
}

export type { Sign };
