import { Routes, Route } from "react-router-dom";
import { Nav } from "./components/Nav";
import { BirthChartPage } from "./pages/BirthChartPage";
import { HoroscopePage } from "./pages/HoroscopePage";
import { PlanetaryMovementsPage } from "./pages/PlanetaryMovementsPage";
import { ExplorersPage } from "./pages/ExplorersPage";
import { GuidePage } from "./pages/GuidePage";

function App() {
  return (
    <div className="app-shell">
      <Nav />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<BirthChartPage />} />
          <Route path="/horoscope" element={<HoroscopePage />} />
          <Route path="/movements" element={<PlanetaryMovementsPage />} />
          <Route path="/explorers" element={<ExplorersPage />} />
          <Route path="/guide" element={<GuidePage />} />
        </Routes>
      </main>
      <footer className="app-footer">
        Astronomical positions computed with the Astronomy Engine ephemeris. Whole Sign houses by
        default. For reflection and entertainment, not professional advice.
      </footer>
    </div>
  );
}

export default App;
