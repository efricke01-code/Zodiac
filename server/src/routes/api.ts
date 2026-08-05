import { Router } from "express";
import { z } from "zod";
import { geocodePlace } from "../geocode.js";
import { timezoneForLocation, localBirthMomentToUtc } from "../timezone.js";
import { buildNatalChart, NatalChart } from "../astro/chart.js";
import { computeTransitPositions, computeTransitsToNatal } from "../astro/transits.js";
import { findUpcomingIngresses, findUpcomingStations, findUpcomingMoonPhases } from "../astro/events.js";
import { generateHoroscope, HoroscopePeriod } from "../horoscope.js";
import { SIGNS, PLANET_KEYS, Sign, PlanetKey } from "../astro/constants.js";
import { SIGN_META } from "../content/signs.js";
import { HOUSE_META } from "../content/houses.js";
import { PLANET_META } from "../content/planets.js";
import { ASPECT_META } from "../content/aspectMeta.js";
import { planetSignHouseParagraph, planetSignParagraph, signHouseParagraph, moonEventForSignParagraph, ingressForSignParagraph, transitToNatalParagraph } from "../content/templates.js";
import { ASPECT_DEFS } from "../astro/aspects.js";

export const apiRouter = Router();

const signEnum = z.enum(SIGNS as unknown as [Sign, ...Sign[]]);
const planetEnum = z.enum(PLANET_KEYS as unknown as [PlanetKey, ...PlanetKey[]]);
const houseSystemEnum = z.enum(["whole-sign", "equal"]);

function handleError(res: import("express").Response, err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  res.status(400).json({ error: message });
}

// ---- Reference metadata for client dropdowns ----
apiRouter.get("/meta", (_req, res) => {
  res.json({
    signs: SIGN_META,
    houses: HOUSE_META,
    planets: PLANET_META,
    aspects: ASPECT_META,
    aspectDefs: ASPECT_DEFS,
  });
});

// ---- Geocoding ----
const geocodeSchema = z.object({ query: z.string().min(2) });

apiRouter.post("/geocode", async (req, res) => {
  try {
    const { query } = geocodeSchema.parse(req.body);
    const results = await geocodePlace(query);
    res.json({ results });
  } catch (err) {
    handleError(res, err);
  }
});

// ---- Birth chart ----
const birthChartSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "time must be HH:MM (24h)"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  place: z.string().optional(),
  houseSystem: houseSystemEnum.optional().default("whole-sign"),
});

apiRouter.post("/birth-chart", (req, res) => {
  try {
    const input = birthChartSchema.parse(req.body);
    const timezone = timezoneForLocation(input.latitude, input.longitude);
    const utcDate = localBirthMomentToUtc(input.date, input.time, timezone);
    const chart = buildNatalChart(utcDate, input.latitude, input.longitude, input.houseSystem);
    res.json({ chart, timezone, place: input.place ?? null });
  } catch (err) {
    handleError(res, err);
  }
});

// ---- Current sky / transiting positions ----
apiRouter.get("/current-sky", (req, res) => {
  try {
    const date = req.query.date ? new Date(String(req.query.date)) : new Date();
    if (isNaN(date.getTime())) throw new Error("Invalid date");
    const positions = computeTransitPositions(date);
    res.json({ date: date.toISOString(), positions });
  } catch (err) {
    handleError(res, err);
  }
});

// ---- Upcoming planetary movements ----
apiRouter.get("/upcoming-events", (req, res) => {
  try {
    const days = Math.min(730, Math.max(1, Number(req.query.days ?? 90)));
    const fromDate = req.query.from ? new Date(String(req.query.from)) : new Date();
    if (isNaN(fromDate.getTime())) throw new Error("Invalid from date");

    const ingresses = findUpcomingIngresses(fromDate, days);
    const stations = findUpcomingStations(fromDate, days);
    const moonPhases = findUpcomingMoonPhases(fromDate, Math.ceil(days / 7.4) + 2);

    res.json({ from: fromDate.toISOString(), days, ingresses, stations, moonPhases });
  } catch (err) {
    handleError(res, err);
  }
});

// ---- Natal chart schema for request bodies (client sends back the chart it stored) ----
const natalChartSchema = z.object({
  dateUtc: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  houseSystem: houseSystemEnum,
  ascendant: z.object({ sign: signEnum, degree: z.number(), longitude: z.number() }),
  midheaven: z.object({ sign: signEnum, degree: z.number(), longitude: z.number() }),
  houses: z.array(z.object({ house: z.number(), cuspLongitude: z.number() })),
  planets: z.array(
    z.object({
      planet: planetEnum,
      sign: signEnum,
      degree: z.number(),
      longitude: z.number(),
      house: z.number(),
      retrograde: z.boolean(),
    }),
  ),
  aspects: z.array(z.any()),
}) satisfies z.ZodType<any>;

// ---- Transits-to-natal aspects for an arbitrary date ----
const transitsSchema = z.object({
  chart: natalChartSchema,
  date: z.string().optional(),
});

apiRouter.post("/transits-to-natal", (req, res) => {
  try {
    const { chart, date } = transitsSchema.parse(req.body);
    const d = date ? new Date(date) : new Date();
    if (isNaN(d.getTime())) throw new Error("Invalid date");
    const aspects = computeTransitsToNatal(chart as unknown as NatalChart, d);
    res.json({ date: d.toISOString(), aspects });
  } catch (err) {
    handleError(res, err);
  }
});

// ---- Horoscope ----
const horoscopeSchema = z.object({
  chart: natalChartSchema,
  period: z.enum(["daily", "weekly", "monthly", "yearly"]),
  from: z.string().optional(),
});

apiRouter.post("/horoscope", (req, res) => {
  try {
    const { chart, period, from } = horoscopeSchema.parse(req.body);
    const fromDate = from ? new Date(from) : new Date();
    if (isNaN(fromDate.getTime())) throw new Error("Invalid from date");
    const result = generateHoroscope(chart as unknown as NatalChart, period as HoroscopePeriod, fromDate);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

// ---- Interpretations ----
apiRouter.get("/interpret/placement", (req, res) => {
  try {
    const planet = planetEnum.parse(req.query.planet);
    const sign = signEnum.parse(req.query.sign);
    const house = z.coerce.number().int().min(1).max(12).parse(req.query.house);
    const retrograde = req.query.retrograde === "true";
    res.json({ paragraph: planetSignHouseParagraph(planet, sign, house, retrograde) });
  } catch (err) {
    handleError(res, err);
  }
});

apiRouter.get("/interpret/sign-house", (req, res) => {
  try {
    const sign = signEnum.parse(req.query.sign);
    const house = z.coerce.number().int().min(1).max(12).parse(req.query.house);
    res.json({ paragraph: signHouseParagraph(sign, house) });
  } catch (err) {
    handleError(res, err);
  }
});

apiRouter.get("/interpret/planet-sign", (req, res) => {
  try {
    const planet = planetEnum.parse(req.query.planet);
    const sign = signEnum.parse(req.query.sign);
    res.json({ paragraph: planetSignParagraph(planet, sign) });
  } catch (err) {
    handleError(res, err);
  }
});

apiRouter.get("/interpret/transit-to-natal", (req, res) => {
  try {
    const transitingPlanet = planetEnum.parse(req.query.transitingPlanet);
    const transitSign = signEnum.parse(req.query.transitSign);
    const aspect = z.enum(["conjunction", "sextile", "square", "trine", "opposition"]).parse(req.query.aspect);
    const natalPlanet = planetEnum.parse(req.query.natalPlanet);
    const natalSign = signEnum.parse(req.query.natalSign);
    const natalHouse = z.coerce.number().int().min(1).max(12).parse(req.query.natalHouse);
    res.json({
      paragraph: transitToNatalParagraph(transitingPlanet, transitSign, aspect, natalPlanet, natalSign, natalHouse),
    });
  } catch (err) {
    handleError(res, err);
  }
});

apiRouter.get("/interpret/moon-event", (req, res) => {
  try {
    const phase = z.enum(["new-moon", "first-quarter", "full-moon", "last-quarter"]).parse(req.query.phase);
    const eventSign = signEnum.parse(req.query.eventSign);
    const natalSign = signEnum.parse(req.query.natalSign);
    const natalPlanet = req.query.natalPlanet ? planetEnum.parse(req.query.natalPlanet) : "Sun";
    res.json({ paragraph: moonEventForSignParagraph(phase, eventSign, natalSign, natalPlanet) });
  } catch (err) {
    handleError(res, err);
  }
});

apiRouter.get("/interpret/ingress", (req, res) => {
  try {
    const planet = planetEnum.parse(req.query.planet);
    const toSign = signEnum.parse(req.query.toSign);
    const natalSign = signEnum.parse(req.query.natalSign);
    const natalPlanet = req.query.natalPlanet ? planetEnum.parse(req.query.natalPlanet) : "Sun";
    res.json({ paragraph: ingressForSignParagraph(planet, toSign, natalSign, natalPlanet) });
  } catch (err) {
    handleError(res, err);
  }
});
