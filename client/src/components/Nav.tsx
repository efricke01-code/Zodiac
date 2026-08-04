import { NavLink } from "react-router-dom";

export function Nav() {
  return (
    <header className="app-header">
      <div className="brand">✨ Zodiac</div>
      <nav className="app-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link nav-link--active" : "nav-link")}>
          Birth Chart
        </NavLink>
        <NavLink to="/horoscope" className={({ isActive }) => (isActive ? "nav-link nav-link--active" : "nav-link")}>
          Horoscope
        </NavLink>
        <NavLink to="/movements" className={({ isActive }) => (isActive ? "nav-link nav-link--active" : "nav-link")}>
          Planetary Movements
        </NavLink>
      </nav>
    </header>
  );
}
