import { useState } from "react";
import { useChartProfile } from "../context/ChartContext";
import { BirthInputForm } from "../components/BirthInputForm";
import { ChartWheel, ChartWheelLegend } from "../components/ChartWheel";
import { PlacementTable } from "../components/PlacementTable";

export function BirthChartPage() {
  const { profile, clearProfile } = useChartProfile();
  const [editing, setEditing] = useState(false);

  if (!profile || editing) {
    return (
      <section className="page">
        <h1>Birth Chart</h1>
        <p className="page-intro">
          Enter a birth date, time, and place to calculate a full natal chart: the Ascendant,
          Midheaven, all ten planets plus the North Node, the houses they fall in, and the major
          aspects between them.
        </p>
        <BirthInputForm onComplete={() => setEditing(false)} />
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-header-row">
        <div>
          <h1>{profile.label}'s Birth Chart</h1>
          <p className="chart-meta">
            {profile.place} · {profile.birthInput.date} at {profile.birthInput.time} ({profile.timezone})
          </p>
        </div>
        <button className="btn-secondary" onClick={() => setEditing(true)}>Edit birth details</button>
      </div>

      <div className="wheel-layout">
        <ChartWheel chart={profile.chart} />
        <ChartWheelLegend />
      </div>

      <PlacementTable chart={profile.chart} />

      <details className="danger-zone">
        <summary>Start over</summary>
        <button className="btn-danger" onClick={clearProfile}>Clear saved birth chart</button>
      </details>
    </section>
  );
}
