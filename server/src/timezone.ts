import { find } from "geo-tz";
import { DateTime } from "luxon";

export function timezoneForLocation(latitude: number, longitude: number): string {
  const zones = find(latitude, longitude);
  return zones[0] ?? "UTC";
}

/**
 * Converts a local wall-clock birth date/time (e.g. "1990-06-15", "14:30")
 * observed in the given IANA time zone into a precise UTC Date, correctly
 * accounting for the historical offset (including DST) in effect at that
 * moment in that zone.
 */
export function localBirthMomentToUtc(
  isoDate: string,
  time: string,
  timeZone: string,
): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const dt = DateTime.fromObject(
    { year, month, day, hour, minute, second: 0 },
    { zone: timeZone },
  );
  if (!dt.isValid) {
    throw new Error(`Invalid date/time/zone combination: ${dt.invalidReason} ${dt.invalidExplanation ?? ""}`);
  }
  return dt.toUTC().toJSDate();
}
