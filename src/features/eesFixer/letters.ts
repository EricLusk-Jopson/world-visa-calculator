/**
 * EES Record Fixer: the two v1 letters, correction and access.
 *
 * Rules (spec "Letter rules"): plain English, under one page, no claim the
 * tool can't support. The diagnosis is a likely explanation, so the letters
 * say "I believe" and "appears", never "the system is wrong". Each citation
 * comes from citations.ts so translations can reuse them.
 */

import { addDays, formatDate, parseDate } from "@/features/calculator/utils/dates";
import {
  ART_35,
  ART_52_1,
  ART_52_2,
  ART_52_3,
  ART_52_4_5,
  EES_REGULATION,
} from "./citations";
import { REPLY_DEADLINE_DAYS } from "./constants";
import { eesCountryName } from "./countries";

export interface PersonalDetails {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportCountry: string;
  email: string;
}

export const EMPTY_DETAILS: PersonalDetails = {
  fullName: "",
  dateOfBirth: "",
  nationality: "",
  passportNumber: "",
  passportCountry: "",
  email: "",
};

/** The crossing a correction letter asks about. */
export interface CrossingClaim {
  /** "missing": the exit isn't recorded. "late": it's recorded on the wrong date. "other": the traveller describes it. */
  kind: "missing" | "late" | "other";
  /** The real exit date. */
  exitDate: string;
  /** ISO code of the country left from. */
  exitCountry?: string;
  /** The date the EES is believed to hold, for "late". */
  recordedExit?: string;
  /** Airport, port or road crossing, if known. */
  borderPoint?: string;
  /** For "other": the traveller's own description of what is wrong. */
  note?: string;
}

/** What the EU checker showed, and what the traveller's dates give. */
export interface CheckerResult {
  arrival: string;
  observed: number;
  mine: number;
}

export interface LetterInput {
  details: PersonalDetails;
  /** ISO code of the country written to. */
  addressedTo?: string;
  sendDate: string;
  evidence: string[];
  checker?: CheckerResult;
  /** The traveller's own words on what is wrong, added as written. */
  note?: string;
}

export interface Letter {
  subject: string;
  body: string;
}

export const LETTER_FOOTER =
  "Prepared with EuroVisaCalculator (eurovisacalculator.com/ees-record-fixer). This letter is not legal advice.";

/** Send date + 45 days. The legal deadline runs from receipt, so this is the earliest it can fall. */
export function replyDeadline(sendDate: string): string {
  return formatDate(addDays(parseDate(sendDate), REPLY_DEADLINE_DAYS));
}

/** "10 July 2026" */
export function longDate(iso: string): string {
  return parseDate(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function identityBlock(d: PersonalDetails): string {
  return [
    `Full name: ${d.fullName || "[full name]"}`,
    `Date of birth: ${d.dateOfBirth ? longDate(d.dateOfBirth) : "[date of birth]"}`,
    `Nationality: ${d.nationality || "[nationality]"}`,
    `Passport number: ${d.passportNumber || "[passport number]"}, issued by ${d.passportCountry || "[issuing country]"}`,
  ].join("\n");
}

function addressee(code?: string): string {
  return code
    ? `To the authority responsible for the Entry/Exit System (EES), ${eesCountryName(code)}`
    : "To the authority responsible for the Entry/Exit System (EES)";
}

function deadlineParagraph(sendDate: string): string {
  return (
    `Under ${ART_52_1.ref} of ${EES_REGULATION}, please reply within ${REPLY_DEADLINE_DAYS} days of receiving this request ` +
    `(by ${longDate(replyDeadline(sendDate))} if it reaches you on ${longDate(sendDate)}). ` +
    `If you refuse any part of it, please send me a written decision with the reasons and how I can challenge it, as ${ART_52_4_5.ref} provides.`
  );
}

function signOff(d: PersonalDetails): string {
  return ["Yours faithfully,", "", d.fullName || "[full name]", d.email || "[email]"].join("\n");
}

function evidenceBlock(evidence: string[]): string {
  if (evidence.length === 0) return "";
  return ["I enclose copies of:", ...evidence.map((e) => `- ${e}`)].join("\n");
}

function checkerSentence(c?: CheckerResult): string {
  if (!c) return "";
  return (
    `The EU's "Check how long you can stay" service shows ${c.observed} remaining day${c.observed === 1 ? "" : "s"} ` +
    `for an arrival on ${longDate(c.arrival)}, while my own travel dates leave me ${c.mine}.`
  );
}

function noteParagraph(note?: string): string {
  return note?.trim() ? `In my own words: ${note.trim()}` : "";
}

function crossingParagraph(c: CrossingClaim): string {
  const from = c.exitCountry ? ` from ${eesCountryName(c.exitCountry)}` : "";
  const at = c.borderPoint ? ` at ${c.borderPoint}` : "";
  const left = `I left the Schengen Area${from}${at} on ${longDate(c.exitDate)}.`;
  switch (c.kind) {
    case "missing":
      return `${left} I believe this exit was not recorded in the EES, so my record appears to show me as still present after that date.`;
    case "late":
      return `${left} I believe this exit was recorded on the wrong date${c.recordedExit ? `, as ${longDate(c.recordedExit)}` : ""}, so my record appears to count days I was not in the Schengen Area.`;
    case "other":
      return `${left}${c.note ? ` ${c.note.trim()}` : ""}`;
  }
}

function correctionAsk(c: CrossingClaim): string {
  const what =
    c.kind === "missing"
      ? `complete my record with an exit on ${longDate(c.exitDate)}`
      : c.kind === "late"
        ? `rectify the exit date in my record to ${longDate(c.exitDate)}`
        : "rectify my record as described above";
  return `Please ${what}, under ${ART_52_3.ref} and ${ART_35.ref} of ${EES_REGULATION}, and confirm the correction to me in writing.`;
}

/** Correction request for one crossing (Art. 52(3) and 35). */
export function correctionLetter(input: LetterInput & { crossing: CrossingClaim }): Letter {
  const { details, crossing, addressedTo, sendDate, evidence, checker, note } = input;
  const responsible = crossing.exitCountry;
  const otherCountry = addressedTo && responsible && addressedTo !== responsible;
  const subject =
    crossing.kind === "other"
      ? `Request to correct my EES record (${ART_52_3.ref}, ${EES_REGULATION})`
      : `Request to correct my EES record: exit on ${longDate(crossing.exitDate)} (${ART_52_3.ref}, ${EES_REGULATION})`;

  const paragraphs = [
    addressee(addressedTo),
    "Dear Sir or Madam,",
    `I am writing under Article 52 of ${EES_REGULATION} to ask you to correct my record in the Entry/Exit System (EES).`,
    identityBlock(details),
    [crossingParagraph(crossing), checkerSentence(checker)].filter(Boolean).join(" "),
    noteParagraph(note),
    correctionAsk(crossing),
    otherCountry
      ? `If ${eesCountryName(addressedTo)} did not enter this data, please pass this request to the authorities of ${eesCountryName(responsible)}, as ${ART_52_2.ref} provides.`
      : "",
    evidenceBlock(evidence),
    deadlineParagraph(sendDate),
    signOff(details),
    "--",
    LETTER_FOOTER,
  ];
  return { subject, body: paragraphs.filter(Boolean).join("\n\n") };
}

/** Access request for every EES record held (Art. 52(1)). */
export function accessLetter(input: LetterInput & { suspects?: CrossingClaim[] }): Letter {
  const { details, addressedTo, sendDate, evidence, checker, note, suspects = [] } = input;
  const subject = `Request for access to my EES data (${ART_52_1.ref}, ${EES_REGULATION})`;
  const suspectBlock =
    suspects.length > 0
      ? [
          "I believe one of these exits may be missing or wrong in my record:",
          ...suspects.map(
            (s) => `- exit${s.exitCountry ? ` from ${eesCountryName(s.exitCountry)}` : ""} on ${longDate(s.exitDate)}`,
          ),
        ].join("\n")
      : "";

  const paragraphs = [
    addressee(addressedTo),
    "Dear Sir or Madam,",
    `Under ${ART_52_1.ref} of ${EES_REGULATION}, I ask for access to all data the Entry/Exit System (EES) holds about me.`,
    identityBlock(details),
    "Please send me every entry and exit record held, with the date, the border crossing point and the country that entered each one, and tell me whether my record shows me as having overstayed.",
    checkerSentence(checker),
    noteParagraph(note),
    suspectBlock,
    suspects.length > 0
      ? `If one of these crossings is missing or wrong, please also treat this letter as a request to correct it under ${ART_52_3.ref}.`
      : "",
    evidenceBlock(evidence),
    deadlineParagraph(sendDate),
    signOff(details),
    "--",
    LETTER_FOOTER,
  ];
  return { subject, body: paragraphs.filter(Boolean).join("\n\n") };
}

/** A mailto: link with the letter filled in. Attachments are added by the traveller. */
export function mailtoHref(letter: Letter, to = ""): string {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(letter.subject)}&body=${encodeURIComponent(letter.body)}`;
}
