import { useEffect, useState } from "react";
import { useChartProfile } from "../context/ChartContext";
import { BirthInputForm } from "../components/BirthInputForm";
import { fetchHoroscope } from "../api/client";
import type { HoroscopePeriod, HoroscopeResult } from "../api/types";
import { PLANET_GLYPHS } from "../api/types";

const PERIODS: { key: HoroscopePeriod; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

export function HoroscopePage() {
  const { profile } = useChartProfile();
  const [period, setPeriod] = useState<HoroscopePeriod>("daily");
  const [result, setResult] = useState<HoroscopeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Never auto-reveal a saved chart's horoscope — same reasoning as the Birth Chart page: a saved
  // profile in this browser shouldn't be shown to whoever opens the page next without asking first.
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!profile || !revealed) return;
    setLoading(true);
    setError(null);
    fetchHoroscope(profile.chart, period)
      .then(setResult)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load horoscope."))
      .finally(() => setLoading(false));
  }, [profile, revealed, period]);

  if (!profile || !revealed) {
    return (
      <section className="page">
        <h1>Horoscope</h1>
        <p className="page-intro">
          Your horoscope is generated from real current planetary movements measured against your
          natal chart. Enter your birth details once and it will be reused here automatically.
        </p>

        {profile && (
          <div className="saved-chart-banner">
            <span>A previously saved chart ({profile.label}) is stored in this browser.</span>
            <div className="saved-chart-banner-actions">
              <button className="btn-secondary" onClick={() => setRevealed(true)}>View my horoscope</button>
            </div>
          </div>
        )}

        <BirthInputForm onComplete={() => setRevealed(true)} />
      </section>
    );
  }

  return (
    <section className="page">
      <h1>Horoscope for {profile.label}</h1>
      <div className="tabs">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            className={`tab ${period === p.key ? "tab--active" : ""}`}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading && <p>Reading the sky…</p>}
      {error && <p className="form-error">{error}</p>}

      {result && !loading && (
        <div className="horoscope-result">
          <p className="horoscope-headline">{result.headline}</p>
          <div className="horoscope-range">
            {new Date(result.from).toLocaleDateString()} – {new Date(result.to).toLocaleDateString()}
          </div>
          {result.keyTransits.length === 0 && (
            <p>No standout transits in this window — a quieter stretch is a good time to keep steady.</p>
          )}
          <ul className="transit-list">
            {result.keyTransits.map((t, i) => (
              <li key={i} className="transit-card">
                <div className="transit-card-title">
                  <span className="glyph">{PLANET_GLYPHS[t.transitingPlanet]}</span> {t.transitingPlanet.replace("NorthNode", "North Node")}
                  {" "}{t.aspectType}{" "}
                  <span className="glyph">{PLANET_GLYPHS[t.natalPlanet]}</span> {t.natalPlanet.replace("NorthNode", "North Node")} (natal)
                </div>
                <p>{t.paragraph}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
