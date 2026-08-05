import { Fragment, useState } from "react";
import type { NatalChart, PlanetKey, Sign } from "../api/types";
import { PLANET_GLYPHS, SIGN_GLYPHS } from "../api/types";
import { fetchPlacementInterpretation, fetchAscendantInterpretation, fetchMidheavenInterpretation } from "../api/client";

function formatDegree(degree: number): string {
  const d = Math.floor(degree);
  const m = Math.floor((degree - d) * 60);
  return `${d}°${m.toString().padStart(2, "0")}'`;
}

type RowKey = PlanetKey | "Ascendant" | "Midheaven";

export function PlacementTable({ chart }: { chart: NatalChart }) {
  const [openRow, setOpenRow] = useState<RowKey | null>(null);
  const [paragraphs, setParagraphs] = useState<Partial<Record<RowKey, string>>>({});
  const [loading, setLoading] = useState<RowKey | null>(null);

  async function togglePlanet(planet: PlanetKey, sign: Sign, house: number, retrograde: boolean) {
    await toggle(planet, () => fetchPlacementInterpretation(planet, sign, house, retrograde));
  }

  async function toggleAscendant(sign: Sign) {
    await toggle("Ascendant", () => fetchAscendantInterpretation(sign));
  }

  async function toggleMidheaven(sign: Sign) {
    await toggle("Midheaven", () => fetchMidheavenInterpretation(sign));
  }

  async function toggle(key: RowKey, fetchParagraph: () => Promise<{ paragraph: string }>) {
    if (openRow === key) {
      setOpenRow(null);
      return;
    }
    setOpenRow(key);
    if (!paragraphs[key]) {
      setLoading(key);
      try {
        const { paragraph } = await fetchParagraph();
        setParagraphs((prev) => ({ ...prev, [key]: paragraph }));
      } catch {
        setParagraphs((prev) => ({ ...prev, [key]: "Could not load interpretation." }));
      } finally {
        setLoading(null);
      }
    }
  }

  return (
    <div className="placement-tables">
      <table className="placement-table">
        <caption>Planets</caption>
        <thead>
          <tr><th>Planet</th><th>Sign</th><th>Degree</th><th>House</th><th></th></tr>
        </thead>
        <tbody>
          {chart.planets.map((p) => (
            <Fragment key={p.planet}>
              <tr
                className="placement-row"
                onClick={() => togglePlanet(p.planet, p.sign, p.house, p.retrograde)}
              >
                <td><span className="glyph">{PLANET_GLYPHS[p.planet]}</span> {p.planet.replace("NorthNode", "North Node")}</td>
                <td><span className="glyph">{SIGN_GLYPHS[p.sign]}</span> {p.sign}</td>
                <td>{formatDegree(p.degree)}{p.retrograde && <span className="retrograde-tag"> ℞</span>}</td>
                <td>{p.house}</td>
                <td className="expand-indicator">{openRow === p.planet ? "▲" : "▼"}</td>
              </tr>
              {openRow === p.planet && (
                <tr className="placement-detail-row">
                  <td colSpan={5}>
                    {loading === p.planet ? "Loading…" : paragraphs[p.planet]}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
          <tr
            className="placement-row placement-row--angle"
            onClick={() => toggleAscendant(chart.ascendant.sign)}
          >
            <td colSpan={2}><span className="glyph glyph--wide">ASC</span> Ascendant <span className="row-note">(Rising Sign)</span></td>
            <td colSpan={2}>{SIGN_GLYPHS[chart.ascendant.sign]} {chart.ascendant.sign} {formatDegree(chart.ascendant.degree)}</td>
            <td className="expand-indicator">{openRow === "Ascendant" ? "▲" : "▼"}</td>
          </tr>
          {openRow === "Ascendant" && (
            <tr className="placement-detail-row">
              <td colSpan={5}>
                {loading === "Ascendant" ? "Loading…" : paragraphs["Ascendant"]}
              </td>
            </tr>
          )}
          <tr
            className="placement-row placement-row--angle"
            onClick={() => toggleMidheaven(chart.midheaven.sign)}
          >
            <td colSpan={2}><span className="glyph glyph--wide">MC</span> Midheaven</td>
            <td colSpan={2}>{SIGN_GLYPHS[chart.midheaven.sign]} {chart.midheaven.sign} {formatDegree(chart.midheaven.degree)}</td>
            <td className="expand-indicator">{openRow === "Midheaven" ? "▲" : "▼"}</td>
          </tr>
          {openRow === "Midheaven" && (
            <tr className="placement-detail-row">
              <td colSpan={5}>
                {loading === "Midheaven" ? "Loading…" : paragraphs["Midheaven"]}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <table className="placement-table">
        <caption>Houses ({chart.houseSystem === "whole-sign" ? "Whole Sign" : "Equal House"})</caption>
        <thead>
          <tr><th>House</th><th>Cusp Sign</th><th>Cusp Degree</th></tr>
        </thead>
        <tbody>
          {chart.houses.map((h) => {
            const sign = signForLongitude(h.cuspLongitude);
            const degree = h.cuspLongitude % 30;
            return (
              <tr key={h.house}>
                <td>{h.house}</td>
                <td><span className="glyph">{SIGN_GLYPHS[sign]}</span> {sign}</td>
                <td>{formatDegree(degree)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const SIGNS_ORDER: Sign[] = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

function signForLongitude(lon: number): Sign {
  const norm = ((lon % 360) + 360) % 360;
  return SIGNS_ORDER[Math.floor(norm / 30) % 12];
}
