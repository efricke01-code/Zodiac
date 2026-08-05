# Zodiac

A full astrology web app in five parts: a **Beginner's Guide** for anyone new to astrology, a
**Birth Chart** calculator, a personal **Horoscope** (daily/weekly/monthly/yearly, generated from
real current transits against your natal chart), a **Planetary Movements** page for what's
happening in the sky right now and what's coming up, and an **Explorers** page with four look-up
tools (sign + house, planet + sign, planet ingress, and lunation).

Planetary positions are computed with [astronomy-engine](https://github.com/cosinekitty/astronomy)
(geocentric, apparent, true-ecliptic-of-date — the standard tropical zodiac reference frame), not
static tables, so charts and transits are accurate for any date. Ascendant/Midheaven use the
standard spherical-astrology formulas; houses default to the Whole Sign system (robust at all
latitudes), with Equal House as an option.

## Project layout

```
server/   Express + TypeScript API: chart math, geocoding, timezone resolution, horoscope/content generation
client/   Vite + React + TypeScript UI: five pages (Beginner's Guide, Birth Chart, Horoscope, Planetary Movements, Explorers)
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
npm start
```

`npm run build` builds the server to `server/dist` and the client to `client/dist`. `npm start`
then runs a single Node process that serves both the API and the built client from one port
(`PORT`, default 4000) — handy for deploying as one service instead of two.

## Deploying it so others can use it

The simplest free option is [Render](https://render.com):

1. Push this repo to your own GitHub account (already done if you're reading this from there).
2. On Render, choose **New → Web Service**, connect the repo, and it should pick up the included
   `render.yaml` automatically (build command `npm run install:all && npm run build`, start command
   `npm start`). If it doesn't auto-detect, enter those commands yourself.
3. Deploy. Render gives you a public `https://your-app.onrender.com` URL — that's the link to share.

Any other host that runs a persistent Node web service (Railway, Fly.io, a plain VPS, etc.) works
the same way: install dependencies, `npm run build`, then `npm start`, exposing whatever port it
sets via the `PORT` environment variable. (Serverless/static-only hosts like plain Vercel or Netlify
won't work as-is since the API needs a long-running Node process.)

Note for free tiers: services on Render's free plan sleep after a period of inactivity and take
~30-60 seconds to wake up on the next visit — expected, not a bug.

## How it works

- **Beginner's Guide**: a plain-language reference for anyone who's never read a birth chart —
  elements, modalities, all 12 signs, all 11 planets/points, all 12 houses, the 5 major aspects, and
  a glossary of chart terms (Ascendant, Midheaven, Descendant, IC, retrograde, transit, orb, etc.),
  plus a one-paragraph framing of how to read any chart (planet = what, sign = how, house = where).
- **Birth Chart**: enter a date, time, and place. The place is geocoded via OpenStreetMap's free
  Nominatim service — self-throttled server-side to at most ~1 request/second with a 24-hour result
  cache and a retry on rate-limit responses, since Nominatim's usage policy is strict and shared
  hosting IPs (e.g. Render's free tier) can trip it even from other tenants' traffic. If Nominatim
  still won't respond, it automatically falls back to [Photon](https://photon.komoot.io) (Komoot's
  free, keyless OSM geocoder on separate infrastructure), so a rate limit on one doesn't take the
  feature down. The local time is then converted to UTC using the place's real IANA time zone (via
  `geo-tz` + `luxon`, so historical DST rules are respected). The server then computes the
  Ascendant, Midheaven, all ten planets plus the mean lunar North Node, house placements, and major
  aspects (conjunction, sextile, square, trine, opposition). The result is rendered as both a list
  and an interactive SVG chart wheel, and you can click any planet row — as well as the Ascendant
  (labeled with its common name, "Rising Sign") and Midheaven rows — for a plain-English paragraph
  about that placement.
- **Horoscope**: reuses the birth chart you already calculated (stored in your browser only — the
  server is stateless and never stores birth data). For each period, it samples upcoming transiting
  positions, finds the tightest-orb aspects to your natal planets (favoring slower, longer-lasting
  transits for the monthly/yearly views), and generates a paragraph per aspect.
- **Planetary Movements**: shows today's planetary positions and a scrollable feed of upcoming sign
  ingresses, retrograde/direct stations, and Moon phases (found numerically, not from a static
  table). Ingress and Full/New Moon entries link straight into the matching Explorers tool, pre-filled
  and auto-run.
- **Explorers**: five independent look-up tools on one page — pick a sign + house (e.g. Leo in the
  12th House), a planet + sign (e.g. Pluto in Scorpio — called out specially when it's the planet's
  own "domicile" sign), a full planet + sign + house combination (e.g. Pluto in Scorpio in the 4th
  House), an upcoming planet ingress + a natal placement (e.g. "Venus moving into Libra, for a
  Gemini Sun," with a line of practical advice), or a Moon phase + sign + a natal placement (e.g.
  "Full Moon in Leo, for a Taurus Sun") — each returns a plain-English paragraph.

## Notes

- **Privacy on shared links/devices**: birth data lives only in the visiting browser's
  `localStorage` — the server never stores it. Because a link doesn't carry any per-user identity,
  the Birth Chart and Horoscope pages always open on the blank input form by default, even if a
  chart is already saved in that browser. If one is, a small banner offers to reveal it, but nothing
  personal is shown until that's clicked — so sending someone your link, or handing off a device,
  doesn't expose whatever was last entered there.
- All interpretive text is generated from structured trait data (per sign, house, planet, and
  aspect) combined by templates — the same approach most astrology content engines use — rather
  than a fixed library of pre-written paragraphs, so every placement/house/transit combination is
  covered.
- This is for reflection and entertainment, not professional or medical advice.
