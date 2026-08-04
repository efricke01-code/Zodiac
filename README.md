# Zodiac

A full astrology web app in three parts: a **Birth Chart** calculator, a personal **Horoscope**
(daily/weekly/monthly/yearly, generated from real current transits against your natal chart), and
a **Planetary Movements** explorer for what's happening in the sky right now, what's coming up, and
a look-up tool for any sign/house/lunation combination.

Planetary positions are computed with [astronomy-engine](https://github.com/cosinekitty/astronomy)
(geocentric, apparent, true-ecliptic-of-date — the standard tropical zodiac reference frame), not
static tables, so charts and transits are accurate for any date. Ascendant/Midheaven use the
standard spherical-astrology formulas; houses default to the Whole Sign system (robust at all
latitudes), with Equal House as an option.

## Project layout

```
server/   Express + TypeScript API: chart math, geocoding, timezone resolution, horoscope/content generation
client/   Vite + React + TypeScript UI: three pages (Birth Chart, Horoscope, Planetary Movements)
```

## Running it locally

Requires Node 18+ (Node 22 recommended).

```bash
npm run install:all   # installs server/ and client/ dependencies
npm run dev           # runs the API on :4000 and the UI on :5173 together
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to the Express server.

Run them separately if you prefer two terminals: `npm run dev:server` and `npm run dev:client`.

### Production build

```bash
npm run build
```

Builds the server to `server/dist` and the client to `client/dist` (a static bundle you can serve
with any static host, pointed at a deployed instance of the API).

## How it works

- **Birth Chart**: enter a date, time, and place. The place is geocoded via OpenStreetMap's free
  Nominatim service, and the local time is converted to UTC using the place's real IANA time zone
  (via `geo-tz` + `luxon`, so historical DST rules are respected). The server then computes the
  Ascendant, Midheaven, all ten planets plus the mean lunar North Node, house placements, and major
  aspects (conjunction, sextile, square, trine, opposition). The result is rendered as both a list
  and an interactive SVG chart wheel, and you can click any planet row for a plain-English paragraph
  about that placement.
- **Horoscope**: reuses the birth chart you already calculated (stored in your browser only — the
  server is stateless and never stores birth data). For each period, it samples upcoming transiting
  positions, finds the tightest-orb aspects to your natal planets (favoring slower, longer-lasting
  transits for the monthly/yearly views), and generates a paragraph per aspect.
- **Planetary Movements**: shows today's planetary positions, a scrollable feed of upcoming sign
  ingresses, retrograde/direct stations, and Moon phases (found numerically, not from a static
  table), plus two look-up tools — pick any sign + house for a paragraph, or pick a Moon phase +
  sign + a natal placement (e.g. "Full Moon in Leo, for a Taurus Sun") for a tailored explanation.

## Notes

- All interpretive text is generated from structured trait data (per sign, house, planet, and
  aspect) combined by templates — the same approach most astrology content engines use — rather
  than a fixed library of pre-written paragraphs, so every placement/house/transit combination is
  covered.
- This is for reflection and entertainment, not professional or medical advice.
