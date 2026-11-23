import { afterEach, describe, expect, it, vi } from "vitest";
import { accessLetter, correctionLetter, EMPTY_DETAILS, mailtoHref, replyDeadline } from "./letters";
import { deadlineCalendar } from "./ics";
import { clearFixerState, FIXER_STORAGE_KEY, INITIAL_STATE, loadFixerState, saveFixerState } from "./storage";

const details = {
  ...EMPTY_DETAILS,
  fullName: "Alex Example",
  dateOfBirth: "1990-04-12",
  nationality: "Canadian",
  passportNumber: "AB123456",
  passportCountry: "Canada",
  email: "alex@example.com",
};

describe("letters", () => {
  it("correction: names the crossing, cites Art. 52(3) and 35, lists proof and the deadline", () => {
    const l = correctionLetter({
      details,
      addressedTo: "ES",
      sendDate: "2026-11-21",
      evidence: ["Boarding pass (paper or mobile)"],
      checker: { arrival: "2026-11-02", observed: 0, mine: 80 },
      crossing: { kind: "missing", exitDate: "2026-07-10", exitCountry: "ES", borderPoint: "Madrid-Barajas airport" },
    });
    expect(l.subject).toContain("exit on 10 July 2026");
    expect(l.body).toContain("Spain");
    expect(l.body).toContain("at Madrid-Barajas airport on 10 July 2026");
    expect(l.body).toContain("Article 52(3) and Article 35");
    expect(l.body).toContain("- Boarding pass (paper or mobile)");
    expect(l.body).toContain("by 5 January 2027");
    expect(l.body).toContain("shows 0 remaining days for an arrival on 2 November 2026, while my own travel dates leave me 80");
    expect(l.body).toContain("not legal advice");
    // A candidate, not a certainty.
    expect(l.body).toMatch(/I believe this exit was not recorded/);
    expect(l.body).not.toMatch(/system is wrong/i);
    expect(l.body).not.toContain("—");
    expect(l.body).not.toContain("Article 52(2)");
  });

  it("correction sent to another country asks it to pass the request on (Art. 52(2))", () => {
    const l = correctionLetter({
      details,
      addressedTo: "FR",
      sendDate: "2026-11-21",
      evidence: [],
      crossing: { kind: "late", exitDate: "2026-07-10", exitCountry: "ES", recordedExit: "2026-08-09" },
    });
    expect(l.body).toContain("If France did not enter this data, please pass this request to the authorities of Spain");
    expect(l.body).toContain("as 9 August 2026");
    expect(l.body).toContain("rectify the exit date in my record to 10 July 2026");
  });

  it("access: asks for every record and names the suspect exits", () => {
    const l = accessLetter({
      details,
      sendDate: "2026-11-21",
      evidence: [],
      suspects: [
        { kind: "missing", exitDate: "2026-08-10", exitCountry: "IT" },
        { kind: "missing", exitDate: "2026-06-10", exitCountry: "ES" },
      ],
    });
    expect(l.subject).toContain("Article 52(1)");
    expect(l.body).toContain("every entry and exit record held");
    expect(l.body).toContain("- exit from Italy on 10 August 2026");
    expect(l.body).toContain("- exit from Spain on 10 June 2026");
  });

  it("leaves placeholders where details are missing", () => {
    const l = accessLetter({ details: EMPTY_DETAILS, sendDate: "2026-11-21", evidence: [] });
    expect(l.body).toContain("[full name]");
    expect(l.body).toContain("[passport number]");
  });

  it("mailto encodes subject and body", () => {
    const href = mailtoHref({ subject: "A & B", body: "line 1\nline 2" }, "ees@example.eu");
    expect(href).toBe("mailto:ees%40example.eu?subject=A%20%26%20B&body=line%201%0Aline%202");
  });

  it("the reply deadline is 45 days after sending", () => {
    expect(replyDeadline("2026-11-21")).toBe("2027-01-05");
  });
});

describe("deadlineCalendar", () => {
  it("has the deadline and a reminder 7 days before, as all-day events", () => {
    const ics = deadlineCalendar("2026-11-21", "ES", new Date("2026-11-21T12:00:00Z"));
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("DTSTART;VALUE=DATE:20270105");
    expect(ics).toContain("DTEND;VALUE=DATE:20270106");
    expect(ics).toContain("SUMMARY:EES reply due from Spain");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261229");
    expect(ics).toContain("DTSTAMP:20261121T120000Z");
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain("https://eurovisacalculator.com/ees-record-fixer");
  });
});

describe("fixer storage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearFixerState();
  });

  it("round-trips through localStorage and clears", () => {
    saveFixerState({ ...INITIAL_STATE, step: 3, details });
    expect(localStorage.getItem(FIXER_STORAGE_KEY)).toContain("AB123456");
    expect(loadFixerState().step).toBe(3);
    clearFixerState();
    expect(localStorage.getItem(FIXER_STORAGE_KEY)).toBeNull();
    expect(loadFixerState()).toEqual(INITIAL_STATE);
  });

  it("keeps working from memory when storage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    saveFixerState({ ...INITIAL_STATE, step: 2 });
    expect(loadFixerState().step).toBe(2);
  });
});
