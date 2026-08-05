import { useState } from "react";
import { useChartProfile } from "../context/ChartContext";
import { BirthInputForm } from "../components/BirthInputForm";
import { ChartWheel, ChartWheelLegend } from "../components/ChartWheel";
import { PlacementTable } from "../components/PlacementTable";

export function BirthChartPage() {
  const { profile, clearProfile } = useChartProfile();
  // Always start on the form, even if a chart is already saved in this browser — showing someone
  // else's birth details automatically (e.g. after handing off a device, or on a shared link) is
  // exactly what we don't want. Viewing a saved chart is an explicit action, never the default.
  const [view, setView] = useState<"form" | "chart">("form");

  if (view === "form" || !profile) {
    return (
      <section className="page">
        <h1>Birth Chart</h1>
        <p className="page-intro">
          Enter a birth date, time, and place to calculate a full natal chart: the Ascendant,
          Midheaven, all ten planets plus the North Node, the houses they fall in, and the major
          aspects between them.
        </p>

        {profile && (
          <div className="saved-chart-banner">
            <span>A previously saved chart ({profile.label}) is stored in this browser.</span>
            <div className="saved-chart-banner-actions">
              <button className="btn-secondary" onClick={() => setView("chart")}>View saved chart</button>
              <button className="btn-danger" onClick={clearProfile}>Forget it</button>
            </div>
          </div>
        )}

        <BirthInputForm onComplete={() => setView("chart")} />
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
        <button className="btn-secondary" onClick={() => setView("form")}>Edit birth details</button>
      </div>

      <div className="wheel-layout">
        <ChartWheel chart={profile.chart} />
        <ChartWheelLegend />
      </div>

      <PlacementTable chart={profile.chart} />

      <div className="danger-zone">
        <button className="btn-danger" onClick={() => { clearProfile(); setView("form"); }}>
          Clear saved birth chart from this browser
        </button>
      </div>
    </section>
  );
}
