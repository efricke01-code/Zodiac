import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchSignHouseInterpretation,
  fetchPlanetSignInterpretation,
  fetchMoonEventInterpretation,
} from "../api/client";
import type { Sign, PlanetKey, MoonPhaseName } from "../api/types";
import { SIGNS, PLANET_KEYS } from "../api/types";

export function ExplorersPage() {
  const [searchParams] = useSearchParams();

  return (
    <section className="page">
      <h1>Explorers</h1>
      <p className="page-intro">
        Three look-up tools for what any sign, house, planet, or lunation means — pick your
        combination and get a plain-English paragraph.
      </p>

      <SignHouseExplorer />
      <PlanetSignExplorer />
      <LunationExplorer initialPhase={searchParams.get("phase") as MoonPhaseName | null} initialSign={searchParams.get("sign") as Sign | null} />
    </section>
  );
}

function SignHouseExplorer() {
  const [sign, setSign] = useState<Sign>("Leo");
  const [house, setHouse] = useState(1);
  const [paragraph, setParagraph] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetchSignHouseInterpretation(sign, house);
      setParagraph(res.paragraph);
    } catch (err) {
      setParagraph(err instanceof Error ? err.message : "Could not load interpretation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="explorer-block">
      <h2>Sign + House Explorer</h2>
      <p className="page-intro">
        Pick a zodiac sign and a house — for example Leo in the 12th House — and get a paragraph on
        what that combination tends to mean.
      </p>
      <div className="explorer-row">
        <select value={sign} onChange={(e) => setSign(e.target.value as Sign)}>
          {SIGNS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={house} onChange={(e) => setHouse(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => <option key={h} value={h}>House {h}</option>)}
        </select>
        <button className="btn-primary" onClick={run} disabled={loading}>
          {loading ? "Loading…" : "Get Interpretation"}
        </button>
      </div>
      {paragraph && <p className="explainer-result">{paragraph}</p>}
    </div>
  );
}

function PlanetSignExplorer() {
  const [planet, setPlanet] = useState<PlanetKey>("Pluto");
  const [sign, setSign] = useState<Sign>("Scorpio");
  const [paragraph, setParagraph] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetchPlanetSignInterpretation(planet, sign);
      setParagraph(res.paragraph);
    } catch (err) {
      setParagraph(err instanceof Error ? err.message : "Could not load interpretation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="explorer-block">
      <h2>Planet + Sign Explorer</h2>
      <p className="page-intro">
        Pick a planet and a sign — for example Pluto in Scorpio — and get a paragraph on what that
        placement tends to mean.
      </p>
      <div className="explorer-row">
        <select value={planet} onChange={(e) => setPlanet(e.target.value as PlanetKey)}>
          {PLANET_KEYS.map((p) => <option key={p} value={p}>{p.replace("NorthNode", "North Node")}</option>)}
        </select>
        <span>in</span>
        <select value={sign} onChange={(e) => setSign(e.target.value as Sign)}>
          {SIGNS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn-primary" onClick={run} disabled={loading}>
          {loading ? "Loading…" : "Get Interpretation"}
        </button>
      </div>
      {paragraph && <p className="explainer-result">{paragraph}</p>}
    </div>
  );
}

function LunationExplorer({ initialPhase, initialSign }: { initialPhase: MoonPhaseName | null; initialSign: Sign | null }) {
  const [phase, setPhase] = useState<MoonPhaseName>(initialPhase ?? "full-moon");
  const [sign, setSign] = useState<Sign>(initialSign ?? "Leo");
  const [natalSign, setNatalSign] = useState<Sign>("Taurus");
  const [natalPlanet, setNatalPlanet] = useState<PlanetKey>("Sun");
  const [paragraph, setParagraph] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetchMoonEventInterpretation(phase, sign, natalSign, natalPlanet);
      setParagraph(res.paragraph);
    } catch (err) {
      setParagraph(err instanceof Error ? err.message : "Could not load interpretation.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-run if we arrived here pre-filled from the Planetary Movements feed's "Explain this" link.
  useEffect(() => {
    if (initialPhase && initialSign) run();
  }, []); // intentionally mount-only: only auto-run once, from the initial query params

  return (
    <div className="explorer-block">
      <h2>Lunation Explorer</h2>
      <p className="page-intro">
        A Full Moon in Leo means something different depending on your own chart. Pick the lunation
        and a natal placement (e.g. your Sun sign) to see what it means for you.
      </p>
      <div className="explorer-row">
        <select value={phase} onChange={(e) => setPhase(e.target.value as MoonPhaseName)}>
          <option value="new-moon">New Moon</option>
          <option value="full-moon">Full Moon</option>
          <option value="first-quarter">First Quarter Moon</option>
          <option value="last-quarter">Last Quarter Moon</option>
        </select>
        <span>in</span>
        <select value={sign} onChange={(e) => setSign(e.target.value as Sign)}>
          {SIGNS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span>for my</span>
        <select value={natalPlanet} onChange={(e) => setNatalPlanet(e.target.value as PlanetKey)}>
          {PLANET_KEYS.map((p) => <option key={p} value={p}>{p.replace("NorthNode", "North Node")}</option>)}
        </select>
        <select value={natalSign} onChange={(e) => setNatalSign(e.target.value as Sign)}>
          {SIGNS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn-primary" onClick={run} disabled={loading}>
          {loading ? "Loading…" : "Explain"}
        </button>
      </div>
      {paragraph && <p className="explainer-result">{paragraph}</p>}
    </div>
  );
}
