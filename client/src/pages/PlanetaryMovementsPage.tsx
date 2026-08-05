import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCurrentSky, fetchUpcomingEvents } from "../api/client";
import type { TransitPlacement, UpcomingEventsResponse, Sign, MoonPhaseName } from "../api/types";
import { PLANET_GLYPHS, SIGN_GLYPHS } from "../api/types";

function formatDegree(degree: number): string {
  const d = Math.floor(degree);
  const m = Math.floor((degree - d) * 60);
  return `${d}°${m.toString().padStart(2, "0")}'`;
}

const PHASE_LABEL: Record<MoonPhaseName, string> = {
  "new-moon": "New Moon",
  "first-quarter": "First Quarter Moon",
  "full-moon": "Full Moon",
  "last-quarter": "Last Quarter Moon",
};

type FeedItem =
  | { kind: "ingress"; date: string; text: string }
  | { kind: "station"; date: string; text: string }
  | { kind: "moon"; date: string; text: string; phase: MoonPhaseName; sign: Sign };

function buildFeed(events: UpcomingEventsResponse): FeedItem[] {
  const items: FeedItem[] = [];
  for (const e of events.ingresses) {
    items.push({
      kind: "ingress",
      date: e.date,
      text: `${e.planet.replace("NorthNode", "North Node")} ${e.retrograde ? "re-enters" : "enters"} ${e.toSign}`,
    });
  }
  for (const e of events.stations) {
    items.push({
      kind: "station",
      date: e.date,
      text: `${e.planet.replace("NorthNode", "North Node")} stations ${e.direction}`,
    });
  }
  for (const e of events.moonPhases) {
    items.push({
      kind: "moon",
      date: e.date,
      text: `${PHASE_LABEL[e.phase]} in ${e.moonSign}`,
      phase: e.phase,
      sign: e.moonSign,
    });
  }
  return items.sort((a, b) => a.date.localeCompare(b.date));
}

export function PlanetaryMovementsPage() {
  const [sky, setSky] = useState<TransitPlacement[] | null>(null);
  const [events, setEvents] = useState<UpcomingEventsResponse | null>(null);
  const [days, setDays] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchCurrentSky(), fetchUpcomingEvents(days)])
      .then(([skyRes, eventsRes]) => {
        setSky(skyRes.positions);
        setEvents(eventsRes);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load planetary data."))
      .finally(() => setLoading(false));
  }, [days]);

  const feed = useMemo(() => (events ? buildFeed(events) : []), [events]);

  return (
    <section className="page">
      <h1>Planetary Movements</h1>
      <p className="page-intro">
        What the sky is doing right now, and what's coming up. Looking for the sign, house, planet,
        or lunation look-up tools? Head to <Link to="/explorers">Explorers</Link>.
      </p>

      {error && <p className="form-error">{error}</p>}

      <h2>Current Sky</h2>
      {loading && !sky ? <p>Loading…</p> : (
        <table className="placement-table">
          <thead><tr><th>Planet</th><th>Sign</th><th>Degree</th><th></th></tr></thead>
          <tbody>
            {sky?.map((p) => (
              <tr key={p.planet}>
                <td><span className="glyph">{PLANET_GLYPHS[p.planet]}</span> {p.planet.replace("NorthNode", "North Node")}</td>
                <td><span className="glyph">{SIGN_GLYPHS[p.sign]}</span> {p.sign}</td>
                <td>{formatDegree(p.degree)}</td>
                <td>{p.retrograde && <span className="retrograde-tag">℞ Retrograde</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="page-header-row">
        <h2>Upcoming Movements</h2>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={30}>Next 30 days</option>
          <option value={60}>Next 60 days</option>
          <option value={90}>Next 90 days</option>
          <option value={180}>Next 6 months</option>
          <option value={365}>Next year</option>
        </select>
      </div>
      <ul className="event-feed">
        {feed.map((item, i) => (
          <li key={i} className={`event-item event-item--${item.kind}`}>
            <span className="event-date">{new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
            <span className="event-text">{item.text}</span>
            {item.kind === "moon" && (item.phase === "full-moon" || item.phase === "new-moon") && (
              <Link className="btn-link" to={`/explorers?phase=${item.phase}&sign=${item.sign}`}>
                Explain this →
              </Link>
            )}
          </li>
        ))}
        {feed.length === 0 && !loading && <li>No events found in this window.</li>}
      </ul>
    </section>
  );
}
