import { useState } from "react";
import type { GeocodeResult, HouseSystem } from "../api/types";
import { geocodePlace, fetchBirthChart } from "../api/client";
import { useChartProfile } from "../context/ChartContext";

interface Props {
  onComplete?: () => void;
  compact?: boolean;
}

export function BirthInputForm({ onComplete, compact }: Props) {
  const { setProfile } = useChartProfile();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [houseSystem, setHouseSystem] = useState<HouseSystem>("whole-sign");
  const [candidates, setCandidates] = useState<GeocodeResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GeocodeResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearchPlace() {
    if (placeQuery.trim().length < 2) return;
    setSearching(true);
    setError(null);
    try {
      const { results } = await geocodePlace(placeQuery.trim());
      setCandidates(results);
      if (results.length === 0) setError("No matching places found. Try being more specific (city, region, country).");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not search for that place.");
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!date || !time) {
      setError("Please provide both a birth date and a birth time.");
      return;
    }
    if (!selectedPlace) {
      setError("Please search for a birth place and select a match from the list.");
      return;
    }
    setSubmitting(true);
    try {
      const birthInput = {
        date, time,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        place: selectedPlace.displayName,
        houseSystem,
      };
      const response = await fetchBirthChart(birthInput);
      setProfile({
        chart: response.chart,
        timezone: response.timezone,
        place: response.place,
        birthInput,
        label: name.trim() || "Your chart",
      });
      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not calculate the birth chart.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={`birth-form ${compact ? "birth-form--compact" : ""}`} onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Name (optional)</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex" />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="date">Birth date</label>
          <input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="time">Birth time</label>
          <input id="time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="place">Birth place</label>
        <div className="place-search">
          <input
            id="place"
            value={placeQuery}
            onChange={(e) => { setPlaceQuery(e.target.value); setSelectedPlace(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearchPlace(); } }}
            placeholder="City, region, country"
          />
          <button type="button" onClick={handleSearchPlace} disabled={searching}>
            {searching ? "Searching…" : "Search"}
          </button>
        </div>
        {candidates.length > 0 && !selectedPlace && (
          <ul className="place-candidates">
            {candidates.map((c) => (
              <li key={`${c.latitude}-${c.longitude}`}>
                <button type="button" onClick={() => { setSelectedPlace(c); setCandidates([]); setPlaceQuery(c.displayName); }}>
                  {c.displayName}
                </button>
              </li>
            ))}
          </ul>
        )}
        {selectedPlace && (
          <p className="place-confirmed">
            ✓ {selectedPlace.displayName} ({selectedPlace.latitude.toFixed(3)}, {selectedPlace.longitude.toFixed(3)})
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="houseSystem">House system</label>
        <select id="houseSystem" value={houseSystem} onChange={(e) => setHouseSystem(e.target.value as HouseSystem)}>
          <option value="whole-sign">Whole Sign (default)</option>
          <option value="equal">Equal House</option>
        </select>
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? "Calculating…" : "Calculate Birth Chart"}
      </button>
    </form>
  );
}
