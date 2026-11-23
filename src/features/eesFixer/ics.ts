/**
 * EES Record Fixer: a calendar file for the reply deadline. Two all-day
 * events: the deadline itself, and a reminder REMINDER_LEAD_DAYS before it.
 * Built in the browser and downloaded; nothing is sent anywhere.
 */

import { addDays, formatDate, parseDate } from "@/features/calculator/utils/dates";
import { REMINDER_LEAD_DAYS } from "./constants";
import { eesCountryName } from "./countries";
import { replyDeadline } from "./letters";

export const FIXER_URL = "https://eurovisacalculator.com/ees-record-fixer";

const compact = (iso: string) => iso.replace(/-/g, "");

/** Escape text for an iCalendar TEXT value (RFC 5545 §3.3.11). */
function esc(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function event(uid: string, date: string, summary: string, description: string, stamp: string): string[] {
  const next = formatDate(addDays(parseDate(date), 1));
  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(date)}`,
    `DTEND;VALUE=DATE:${compact(next)}`,
    `SUMMARY:${esc(summary)}`,
    `DESCRIPTION:${esc(description)}`,
    `URL:${FIXER_URL}`,
    "END:VEVENT",
  ];
}

/**
 * The .ics text for a request sent on `sendDate` to `country` (ISO code).
 * `now` only sets DTSTAMP, so tests can fix it.
 */
export function deadlineCalendar(sendDate: string, country?: string, now = new Date()): string {
  const deadline = replyDeadline(sendDate);
  const reminder = formatDate(addDays(parseDate(deadline), -REMINDER_LEAD_DAYS));
  const from = country ? eesCountryName(country) : "the EES authority";
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const id = `${compact(sendDate)}-${country ?? "xx"}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EuroVisaCalculator//EES Record Fixer//EN",
    "CALSCALE:GREGORIAN",
    ...event(
      `ees-reply-${id}@eurovisacalculator.com`,
      deadline,
      `EES reply due from ${from}`,
      `The 45-day reply deadline under Article 52(1) of Regulation (EU) 2017/2226 for the request sent on ${sendDate}. No reply? Contact the national data protection authority. ${FIXER_URL}`,
      stamp,
    ),
    ...event(
      `ees-reminder-${id}@eurovisacalculator.com`,
      reminder,
      `EES reply due in ${REMINDER_LEAD_DAYS} days (${from})`,
      `Your EES request sent on ${sendDate} is due a reply by ${deadline}. ${FIXER_URL}`,
      stamp,
    ),
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}
