import { useEffect, useState } from "react";
import { fetchMeta } from "../api/client";
import type { ApiMeta, Sign, PlanetKey } from "../api/types";
import { SIGNS, PLANET_KEYS, SIGN_GLYPHS, PLANET_GLYPHS } from "../api/types";

const SPEED_LABEL: Record<"personal" | "social" | "generational", string> = {
  personal: "Personal planet — moves quickly, so it describes your individual personality.",
  social: "Social planet — moves more slowly, so it's shared by a broad age group.",
  generational: "Generational planet — moves very slowly, so it shapes whole generations more than any one person.",
};

const ASPECT_ORDER: Array<"conjunction" | "sextile" | "square" | "trine" | "opposition"> = [
  "conjunction", "sextile", "square", "trine", "opposition",
];

export function GuidePage() {
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMeta()
      .then(setMeta)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load the guide."));
  }, []);

  if (error) return <section className="page"><p className="form-error">{error}</p></section>;
  if (!meta) return <section className="page"><p>Loading guide…</p></section>;

  return (
    <section className="page">
      <h1>Beginner's Guide</h1>
      <p className="page-intro">
        New to astrology? Here's everything used elsewhere in this app, explained in plain language.
      </p>

      <div className="guide-callout">
        <h2 style={{ marginTop: 0 }}>How to read a birth chart in one sentence</h2>
        <p>
          Every placement in a chart answers three questions at once: the <strong>planet</strong> is
          <em> what</em> — the kind of energy (your drive, your emotions, your communication style);
          the <strong>sign</strong> it's in is <em> how</em> — the flavor or style that energy takes;
          and the <strong>house</strong> it falls in is <em> where</em> — the area of life it shows up
          in most. <strong>Aspects</strong> then describe how two placements talk to each other. Put
          those four pieces together — planet, sign, house, aspect — and you can read any chart.
        </p>
      </div>

      <h2>Elements</h2>
      <p className="page-intro">Every sign belongs to one of four elements, its most basic nature.</p>
      <div className="guide-grid">
        {(["Fire", "Earth", "Air", "Water"] as const).map((el) => {
          const e = meta.elements[el];
          return (
            <div key={el} className="guide-card">
              <h3>{e.title}</h3>
              <p className="guide-card-tag">{e.signs.join(" · ")}</p>
              <p>{e.description}</p>
            </div>
          );
        })}
      </div>

      <h2>Modalities</h2>
      <p className="page-intro">Every sign also has a modality, describing how it moves through change.</p>
      <div className="guide-grid">
        {(["Cardinal", "Fixed", "Mutable"] as const).map((mod) => {
          const m = meta.modalities[mod];
          return (
            <div key={mod} className="guide-card">
              <h3>{m.title}</h3>
              <p className="guide-card-tag">{m.signs.join(" · ")}</p>
              <p>{m.description}</p>
            </div>
          );
        })}
      </div>

      <h2>The 12 Signs</h2>
      <div className="guide-list">
        {SIGNS.map((sign: Sign) => {
          const s = meta.signs[sign];
          return (
            <details key={sign} className="guide-details">
              <summary>
                <span className="glyph">{SIGN_GLYPHS[sign]}</span> {sign}
                <span className="guide-summary-tag">{s.element} · {s.modality}</span>
              </summary>
              <p>
                Ruled by {s.ruler}. {s.sign} is {s.essence}. Common keywords: {s.keywords.join(", ")}.
                The growth edge to watch for is {s.shadow}.
              </p>
            </details>
          );
        })}
      </div>

      <h2>The Planets</h2>
      <p className="page-intro">
        Includes the two "luminaries" (Sun and Moon) and the mean North Node, alongside the eight
        traditional and modern planets.
      </p>
      <div className="guide-list">
        {PLANET_KEYS.map((planet: PlanetKey) => {
          const p = meta.planets[planet];
          return (
            <details key={planet} className="guide-details">
              <summary>
                <span className="glyph">{PLANET_GLYPHS[planet]}</span> {p.title}
                <span className="guide-summary-tag">{p.keyword}</span>
              </summary>
              <p>
                {p.title} represents {p.represents}. {SPEED_LABEL[p.speed]}
              </p>
            </details>
          );
        })}
      </div>

      <h2>The 12 Houses</h2>
      <p className="page-intro">
        The houses are fixed to your Ascendant, so unlike signs, everyone's houses are personal to
        their own birth chart.
      </p>
      <div className="guide-list">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
          const h = meta.houses[house];
          return (
            <details key={house} className="guide-details">
              <summary>
                House {house}: {h.title}
              </summary>
              <p>
                Governs {h.domain}. Common keywords: {h.keywords.join(", ")}.
              </p>
            </details>
          );
        })}
      </div>

      <h2>Aspects</h2>
      <p className="page-intro">
        The five major aspects, in order of the angle between two placements.
      </p>
      <div className="guide-grid">
        {ASPECT_ORDER.map((type) => {
          const a = meta.aspects[type];
          const def = meta.aspectDefs.find((d) => d.type === type);
          return (
            <div key={type} className="guide-card">
              <h3 style={{ textTransform: "capitalize" }}>{type}</h3>
              <p className="guide-card-tag">
                {def?.angle}° apart (±{def?.orb}° orb) · {def?.nature}
              </p>
              <p>{a.description}</p>
            </div>
          );
        })}
      </div>

      <h2>Chart Terms Glossary</h2>
      <dl className="guide-glossary">
        {meta.chartTerms.map((t) => (
          <div key={t.term} className="guide-glossary-entry">
            <dt>{t.term}</dt>
            <dd>{t.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
