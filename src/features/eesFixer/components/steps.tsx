/**
 * EES Record Fixer: the six steps. Each reads and writes FixerState through
 * `update`; EesFixer owns navigation and storage.
 */
import { useMemo, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { VisaRegion, type Traveler, type Trip } from "@/types";
import { tokens } from "@/styles/theme";
import { isValidDateString } from "@/features/calculator/utils/dates";
import { SchengenSources } from "@/data/sources";
import {
  describeHypothesis,
  formatLong,
  type Diagnosis,
  type FixerTrip,
  type Hypothesis,
  type ResolvedTrip,
} from "../engine";
import { EES_FULL, EES_START, REPLY_DEADLINE_DAYS } from "../constants";
import { EES_COUNTRIES, eesCountryName } from "../countries";
import { EVIDENCE, RATING_LABEL, evidenceLabels, type EvidenceRating } from "../evidence";
import { accessLetter, correctionLetter, longDate, mailtoHref, replyDeadline, type Letter } from "../letters";
import { deadlineCalendar } from "../ics";
import { tripKey, type FixerProblem, type FixerState } from "../storage";
import { TimelineDiff } from "./TimelineDiff";
import { Btn, Callout, FieldLabel, StepTitle } from "./ui";
import { inputSx } from "./styles";

export const EU_CHECKER_URL = SchengenSources.eesChecker.direct.url;
export const EU_CONTACTS_URL = SchengenSources.eesChecker.parent.url;

export interface StepProps {
  state: FixerState;
  update: (patch: Partial<FixerState>) => void;
  diagnosis: Diagnosis | null;
  today: string;
  record: ResolvedTrip[];
  fixerTrips: FixerTrip[];
  surface: "landing" | "app";
}

const ExtLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

function CountrySelect({ id, value, onChange, placeholder = "Not sure" }: { id: string; value?: string | null; onChange: (code: string | undefined) => void; placeholder?: string }) {
  return (
    <Box component="select" id={id} value={value ?? ""} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value || undefined)} sx={inputSx}>
      <option value="">{placeholder}</option>
      {EES_COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </Box>
  );
}

// ─── 1. Problem ───────────────────────────────────────────────────────────────

const PROBLEMS: { id: FixerProblem; icon: string; title: string; desc: string }[] = [
  {
    id: "missing_exit",
    icon: "✈️",
    title: "I left, but the system thinks I'm still here",
    desc: "Your exit from the Schengen Area wasn't recorded, so the days keep counting.",
  },
  {
    id: "zero_days",
    icon: "🔍",
    title: "The EU checker says 0 days and I don't know why",
    desc: "We'll work out which crossing is most likely missing, or ask the authorities for your full record.",
  },
  {
    id: "wrong_date",
    icon: "📅",
    title: "A date or a trip in my record is wrong",
    desc: "For example a wrong exit date, or a trip you never made.",
  },
];

export function ProblemStep({ state, update }: StepProps) {
  return (
    <>
      <StepTitle sub="Choose the one closest to yours. It sets which letter you'll get.">What happened?</StepTitle>
      <Box role="radiogroup" aria-label="What happened?" sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {PROBLEMS.map((p) => {
          const on = state.problem === p.id;
          return (
            <Box
              key={p.id}
              component="button"
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => update({ problem: p.id, letterKind: null })}
              sx={{
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
                textAlign: "left",
                p: "14px 16px",
                borderRadius: "12px",
                cursor: "pointer",
                bgcolor: on ? tokens.greenBg : tokens.white,
                border: `1.5px solid ${on ? tokens.green : tokens.border}`,
                fontFamily: tokens.fontBody,
                transition: "border-color 0.12s, background-color 0.12s",
                "&:hover": { borderColor: on ? tokens.green : tokens.navyMid },
                "&:focus-visible": { outline: `2px solid ${tokens.green}`, outlineOffset: "2px" },
              }}
            >
              <Box component="span" aria-hidden sx={{ fontSize: "1.5rem", lineHeight: 1 }}>
                {p.icon}
              </Box>
              <Box component="span">
                <Box component="span" sx={{ display: "block", fontWeight: 700, color: tokens.navy, fontSize: "0.98rem" }}>
                  {p.title}
                </Box>
                <Box component="span" sx={{ display: "block", color: tokens.textSoft, fontSize: "0.86rem", mt: "2px" }}>
                  {p.desc}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.8rem", color: tokens.textSoft, mt: "14px" }}>
        Told you overstayed when you didn't, or you now live in Europe? Those requests are coming. Until then, see{" "}
        <a href="/blog/schengen-overstay-consequences">what happens after an overstay</a>.
      </Typography>
    </>
  );
}

// ─── 2. Trips ─────────────────────────────────────────────────────────────────

interface TripsStepProps extends StepProps {
  travelers: Traveler[];
  traveler: Traveler | null;
  schengenTrips: Trip[];
  onTripsChange: (next: Trip[]) => void;
}

export function TripsStep({ state, update, travelers, traveler, schengenTrips, onTripsChange, today, surface }: TripsStepProps) {
  const sorted = [...schengenTrips].sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1));
  const [draft, setDraft] = useState({ entry: "", exit: "", entryCountry: "", exitCountry: "" });
  const draftOk = isValidDateString(draft.entry) && (draft.exit === "" || (isValidDateString(draft.exit) && draft.exit >= draft.entry));

  const setCountries = (key: string, patch: { entry?: string; exit?: string }) =>
    update({ tripCountries: { ...state.tripCountries, [key]: { ...state.tripCountries[key], ...patch } } });

  const editTrip = (trip: Trip, patch: { entryDate?: string; exitDate?: string | undefined }) => {
    const next = { ...trip, ...patch };
    if (!isValidDateString(next.entryDate)) return;
    if (next.exitDate && (!isValidDateString(next.exitDate) || next.exitDate < next.entryDate)) return;
    const oldKey = tripKey(trip.entryDate, trip.exitDate);
    const newKey = tripKey(next.entryDate, next.exitDate);
    if (oldKey !== newKey && state.tripCountries[oldKey]) {
      const { [oldKey]: moved, ...rest } = state.tripCountries;
      update({ tripCountries: { ...rest, [newKey]: moved } });
    }
    onTripsChange(schengenTrips.map((t) => (t.id === trip.id ? next : t)));
  };

  const addTrip = () => {
    if (!draftOk) return;
    const trip: Trip = {
      id: crypto.randomUUID(),
      entryDate: draft.entry,
      exitDate: draft.exit || undefined,
      region: VisaRegion.Schengen,
    };
    onTripsChange([...schengenTrips, trip]);
    setCountries(tripKey(trip.entryDate, trip.exitDate), {
      entry: draft.entryCountry || undefined,
      exit: draft.exitCountry || undefined,
    });
    setDraft({ entry: "", exit: "", entryCountry: "", exitCountry: "" });
  };

  const future = schengenTrips.filter((t) => t.entryDate > today).length;

  return (
    <>
      <StepTitle
        sub={
          <>
            Check each Schengen trip against your boarding passes and bookings, and add the country you entered and left
            through. The country you left from is the one that corrects a missing exit.
            {surface === "app" ? " Changes here update your calculator." : " Trips are saved to your calculator on this device."}
          </>
        }
      >
        Your trips
      </StepTitle>

      {travelers.length > 1 && (
        <Box sx={{ mb: "16px", maxWidth: 320 }}>
          <FieldLabel htmlFor="fixer-traveler">Whose record?</FieldLabel>
          <Box
            component="select"
            id="fixer-traveler"
            value={traveler?.id ?? ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update({ travelerId: e.target.value })}
            sx={inputSx}
          >
            {travelers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Box>
        </Box>
      )}

      {sorted.length === 0 && (
        <Callout title="No Schengen trips yet">
          Add every trip from the last 180 days before the date you checked, and any trip since 12 October 2025 you think
          the EES may have wrong. No trips at all, but the EU checker still counts days? Carry on: the letter will ask for
          your full record.
        </Callout>
      )}

      <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, display: "flex", flexDirection: "column", gap: "10px", mt: sorted.length ? 0 : "12px" }}>
        {sorted.map((t) => {
          const key = tripKey(t.entryDate, t.exitDate);
          const c = state.tripCountries[key] ?? {};
          const preEes = (t.exitDate ?? today) < EES_START;
          return (
            <Box
              component="li"
              key={t.id}
              sx={{
                border: `1px solid ${tokens.border}`,
                borderRadius: "12px",
                p: "12px",
                bgcolor: t.entryDate > today ? tokens.mist : tokens.white,
              }}
            >
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: "10px" }}>
                <Box>
                  <FieldLabel htmlFor={`in-${t.id}`}>Entered</FieldLabel>
                  <Box component="input" type="date" id={`in-${t.id}`} defaultValue={t.entryDate} onBlur={(e: React.FocusEvent<HTMLInputElement>) => editTrip(t, { entryDate: e.target.value })} sx={inputSx} />
                </Box>
                <Box>
                  <FieldLabel htmlFor={`out-${t.id}`}>Left</FieldLabel>
                  <Box
                    component="input"
                    type="date"
                    id={`out-${t.id}`}
                    defaultValue={t.exitDate ?? ""}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => editTrip(t, { exitDate: e.target.value || undefined })}
                    sx={inputSx}
                  />
                </Box>
                <Box>
                  <FieldLabel htmlFor={`cin-${t.id}`}>Entered through</FieldLabel>
                  <CountrySelect id={`cin-${t.id}`} value={c.entry} onChange={(v) => setCountries(key, { entry: v })} />
                </Box>
                <Box>
                  <FieldLabel htmlFor={`cout-${t.id}`}>Left from</FieldLabel>
                  <CountrySelect id={`cout-${t.id}`} value={c.exit} onChange={(v) => setCountries(key, { exit: v })} />
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "8px", gap: "8px", flexWrap: "wrap" }}>
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.76rem", color: tokens.textSoft }}>
                  {t.entryDate > today
                    ? "Planned: left out of the diagnosis, since the EES can't know it yet."
                    : !t.exitDate
                      ? "Still there: counted to today."
                      : preEes
                        ? "Before 12 Oct 2025: not in the EES, but the 90/180 rule still counts it."
                        : ""}
                </Typography>
                <Btn variant="ghost" onClick={() => onTripsChange(schengenTrips.filter((x) => x.id !== t.id))}>
                  Remove
                </Btn>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ mt: "16px", border: `1px dashed ${tokens.border}`, borderRadius: "12px", p: "12px" }}>
        <Typography sx={{ fontFamily: tokens.fontBody, fontWeight: 700, fontSize: "0.88rem", color: tokens.navy, mb: "8px" }}>
          Add a trip
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: "10px" }}>
          <Box>
            <FieldLabel htmlFor="add-in">Entered</FieldLabel>
            <Box component="input" type="date" id="add-in" value={draft.entry} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, entry: e.target.value })} sx={inputSx} />
          </Box>
          <Box>
            <FieldLabel htmlFor="add-out">Left (blank if still there)</FieldLabel>
            <Box component="input" type="date" id="add-out" value={draft.exit} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, exit: e.target.value })} sx={inputSx} />
          </Box>
          <Box>
            <FieldLabel htmlFor="add-cin">Entered through</FieldLabel>
            <CountrySelect id="add-cin" value={draft.entryCountry} onChange={(v) => setDraft({ ...draft, entryCountry: v ?? "" })} />
          </Box>
          <Box>
            <FieldLabel htmlFor="add-cout">Left from</FieldLabel>
            <CountrySelect id="add-cout" value={draft.exitCountry} onChange={(v) => setDraft({ ...draft, exitCountry: v ?? "" })} />
          </Box>
        </Box>
        <Box sx={{ mt: "10px" }}>
          <Btn variant="secondary" onClick={addTrip} disabled={!draftOk}>
            + Add trip
          </Btn>
        </Box>
      </Box>

      {future > 0 && (
        <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.8rem", color: tokens.textSoft, mt: "10px" }}>
          {future} planned trip{future === 1 ? "" : "s"} after today won't be counted: the EU checker only knows crossings that
          have happened.
        </Typography>
      )}
    </>
  );
}

// ─── 3. Diagnosis ─────────────────────────────────────────────────────────────

export function DiagnosisStep({ state, update, diagnosis, record, maxProbes }: StepProps & { maxProbes: number }) {
  const first = state.observations[0];
  const setFirst = (patch: Partial<{ date: string; remaining: number | null }>) =>
    // A new arrival or result makes any probe results meaningless.
    update({ observations: [{ ...first, ...patch }] });

  const probes = state.observations.slice(1);
  const setProbe = (date: string, remaining: number | null) => {
    const others = state.observations.filter((o, i) => i === 0 || o.date !== date);
    update({ observations: [...others, { date, remaining }] });
  };

  return (
    <>
      <StepTitle
        sub={
          <>
            Open the EU's <ExtLink href={EU_CHECKER_URL}>Check how long you can stay</ExtLink> page, then enter the arrival
            date you typed into it and the result it gave.
          </>
        }
      >
        What did the EU checker say?
      </StepTitle>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: "12px", mb: "18px" }}>
        <Box>
          <FieldLabel htmlFor="obs-date">Arrival date you entered</FieldLabel>
          <Box component="input" type="date" id="obs-date" value={first.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirst({ date: e.target.value })} sx={inputSx} />
        </Box>
        <Box>
          <FieldLabel htmlFor="obs-days">"Remaining days at the moment of entry"</FieldLabel>
          <Box
            component="input"
            type="number"
            inputMode="numeric"
            min={0}
            max={90}
            id="obs-days"
            value={first.remaining ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirst({ remaining: e.target.value === "" ? null : clampDays(e.target.value) })}
            sx={inputSx}
          />
        </Box>
        <Box>
          <FieldLabel>"Authorised stay"</FieldLabel>
          <Box role="radiogroup" aria-label="Authorised stay" sx={{ display: "flex", gap: "8px" }}>
            {(["ok", "not_ok"] as const).map((v) => (
              <Box
                key={v}
                component="button"
                type="button"
                role="radio"
                aria-checked={state.checkerStatus === v}
                onClick={() => update({ checkerStatus: v })}
                sx={{
                  ...inputSx,
                  flex: 1,
                  cursor: "pointer",
                  fontWeight: 700,
                  bgcolor: state.checkerStatus === v ? (v === "ok" ? tokens.greenBg : tokens.redBg) : tokens.white,
                  borderColor: state.checkerStatus === v ? (v === "ok" ? tokens.green : tokens.red) : tokens.border,
                  color: state.checkerStatus === v ? (v === "ok" ? tokens.greenText : tokens.redText) : tokens.textSoft,
                }}
              >
                {v === "ok" ? "OK" : "NOT OK"}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {!diagnosis ? (
        <Callout>Enter the date and the number of days to see the diagnosis.</Callout>
      ) : (
        <DiagnosisResult diagnosis={diagnosis} record={record} arrival={first.date} probes={probes} maxProbes={maxProbes} setProbe={setProbe} clearProbes={() => update({ observations: [first] })} />
      )}

      {state.problem === "wrong_date" && diagnosis && diagnosis.letter && (
        <Box sx={{ mt: "18px" }}>
          <FieldLabel htmlFor="manual-note">What's wrong in your record, in your own words (optional, added to the letter)</FieldLabel>
          <Box
            component="textarea"
            id="manual-note"
            rows={3}
            value={state.manualNote}
            placeholder="e.g. My record shows an entry to Greece on 3 May 2026. I was in Canada that week."
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update({ manualNote: e.target.value })}
            sx={{ ...inputSx, py: "10px", resize: "vertical", fontFamily: tokens.fontBody }}
          />
        </Box>
      )}

      {diagnosis && diagnosis.excludedFutureTrips > 0 && (
        <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.78rem", color: tokens.textSoft, mt: "10px" }}>
          Left out: {diagnosis.excludedFutureTrips} planned trip{diagnosis.excludedFutureTrips === 1 ? "" : "s"} after today.
        </Typography>
      )}
    </>
  );
}

function clampDays(raw: string): number {
  const n = Math.round(Number(raw));
  return Number.isFinite(n) ? Math.min(90, Math.max(0, n)) : 0;
}

/** One hypothesis per trip, best first, for listing. */
function byTrip(candidates: Hypothesis[]): Hypothesis[] {
  const seen = new Set<string>();
  return candidates.filter((c) => (seen.has(c.trip.id) ? false : (seen.add(c.trip.id), true)));
}

function DiagnosisResult({
  diagnosis: d,
  record,
  arrival,
  probes,
  maxProbes,
  setProbe,
  clearProbes,
}: {
  diagnosis: Diagnosis;
  record: ResolvedTrip[];
  arrival: string;
  probes: { date: string; remaining: number | null }[];
  maxProbes: number;
  setProbe: (date: string, remaining: number | null) => void;
  clearProbes: () => void;
}) {
  const counts = (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", mb: "14px" }}>
      <Figure label="Your dates give" value={d.mine} tone="good" />
      <Figure label="The EU checker shows" value={d.observed} tone={d.observed < d.mine ? "bad" : "good"} />
    </Box>
  );

  if (d.verdict === "RULE_PROBLEM") {
    return (
      <>
        {counts}
        <Callout tone="bad" title="The rule is the problem, not the record">
          By your own dates you'd have 0 days left on {formatLong(arrival)}, so the EU checker agrees with you. No record is
          wrong and there's no letter to write. <a href="/app">Open the calculator</a> to find a date that fits.
        </Callout>
      </>
    );
  }

  if (d.verdict === "NO_DISCREPANCY") {
    return (
      <>
        {counts}
        {d.preEesWarning ? (
          <Callout tone="warn" title="The EU checker can't see trips before 12 October 2025">
            It shows more days than your own count because some of your trips predate the EES. The 90/180 rule still counts
            them while they're inside the 180-day window, so plan with your own figure. Nothing in the record needs fixing.
          </Callout>
        ) : (
          <Callout tone="good" title="Nothing to fix">
            The EU checker gives you at least as many days as your own dates. Your record looks right for this date.
          </Callout>
        )}
      </>
    );
  }

  const candidates = byTrip(d.candidates);
  const top = d.flagged ?? d.candidates[0];
  const pendingProbe = d.probe ? probes.find((p) => p.date === d.probe) : undefined;

  return (
    <>
      {counts}
      {(d.verdict === "MISSING_EXIT" || d.verdict === "LATE_EXIT") && d.flagged && (
        <>
          <Callout tone="warn" title="Most likely explanation">
            {describeHypothesis(d.flagged, eesCountryName)}. That would give exactly what the EU checker shows
            {d.flagged.match === "CONSISTENT" && " (a 0 can come from several errors, so treat this as likely, not certain)"}.
            {d.flagged.trip.exitCountry ? (
              <>
                {" "}
                {eesCountryName(d.flagged.trip.exitCountry)} recorded that crossing, so the correction request goes there.
              </>
            ) : (
              <> Go back to Trips and add the country you left from, so the letter goes to the right authority.</>
            )}
          </Callout>
          {d.flagged.prior === "HIGH" && (
            <Box sx={{ mt: "10px" }}>
              <Callout title="This trip ended during the EES start-up">
                Between 12 October 2025 and {formatLong(EES_FULL)} some crossings were deliberately not registered while
                countries switched the system on. A gap from then isn't necessarily a mistake, but if the EU checker counts
                it against you, asking for the exit to be added is still the right step.
              </Callout>
            </Box>
          )}
        </>
      )}

      {d.verdict === "AMBIGUOUS" && (
        <Callout tone="warn" title={`${candidates.length} trips could explain this`}>
          <Box component="ul" sx={{ m: "4px 0 0", pl: "20px" }}>
            {candidates.map((c) => (
              <li key={c.trip.id}>{describeHypothesis(c, eesCountryName)}</li>
            ))}
          </Box>
        </Callout>
      )}

      {d.verdict === "UNEXPLAINED" && (
        <Callout tone="warn" title="No single missing or late exit explains this">
          Your record may hold a trip you never made, or an entry on the wrong date. The letter asks the authority for every
          entry and exit it holds on you, so you can see what's wrong.
        </Callout>
      )}

      {top && (
        <Box sx={{ mt: "14px" }}>
          <TimelineDiff record={record} hypothesis={top} arrival={arrival} />
        </Box>
      )}

      {d.verdict === "AMBIGUOUS" && d.probe && (
        <Box sx={{ mt: "14px" }}>
          <Callout tone="info" title="One more check will tell them apart">
            In the <ExtLink href={EU_CHECKER_URL}>EU checker</ExtLink>, enter <strong>{formatLong(d.probe)}</strong> as the
            arrival date (keep any departure date), and type the remaining days it shows:
            <Box sx={{ display: "flex", gap: "8px", alignItems: "center", mt: "8px", maxWidth: 260 }}>
              <Box
                component="input"
                type="number"
                inputMode="numeric"
                min={0}
                max={90}
                aria-label={`Remaining days for ${formatLong(d.probe)}`}
                value={pendingProbe?.remaining ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProbe(d.probe!, e.target.value === "" ? null : clampDays(e.target.value))}
                sx={inputSx}
              />
              <span>days</span>
            </Box>
          </Callout>
        </Box>
      )}

      {d.verdict === "AMBIGUOUS" && !d.probe && (
        <Box sx={{ mt: "14px" }}>
          <Callout>
            {probes.length >= maxProbes
              ? "The extra checks didn't single out one trip."
              : "No date in the next six months would tell these trips apart in the EU checker."}{" "}
            The letter asks for your full record first (Article 52(1)) and names these exits, so the authority can check them.
          </Callout>
        </Box>
      )}

      {probes.length > 0 && (
        <Box sx={{ mt: "10px" }}>
          <Btn variant="ghost" onClick={clearProbes}>
            Clear the extra checks
          </Btn>
        </Box>
      )}
    </>
  );
}

function Figure({ label, value, tone }: { label: string; value: number; tone: "good" | "bad" }) {
  return (
    <Box sx={{ border: `1px solid ${tokens.border}`, borderRadius: "12px", p: "10px 14px", bgcolor: tokens.white }}>
      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.74rem", fontWeight: 700, color: tokens.textSoft, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: tokens.fontDisplay, fontSize: "1.6rem", fontWeight: 700, color: tone === "bad" ? tokens.redText : tokens.navy, lineHeight: 1.2 }}>
        {value} <Box component="span" sx={{ fontSize: "0.9rem", fontWeight: 500, color: tokens.textSoft }}>days</Box>
      </Typography>
    </Box>
  );
}

// ─── 4. Proof ─────────────────────────────────────────────────────────────────

export function ProofStep({ state, update, diagnosis }: StepProps) {
  const f = diagnosis?.flagged;
  const toggle = (id: string) =>
    update({ evidence: state.evidence.includes(id) ? state.evidence.filter((x) => x !== id) : [...state.evidence, id] });
  const groups: EvidenceRating[] = ["required", "best", "helps"];

  return (
    <>
      <StepTitle
        sub={
          <>
            {f
              ? `Prove that you left ${f.trip.exitCountry ? eesCountryName(f.trip.exitCountry) : "the Schengen Area"} on ${formatLong(f.trip.exit!)}, and that you were outside the Schengen Area afterwards.`
              : "Prove when you left, and that you were outside the Schengen Area afterwards."}{" "}
            Tick what you have. The letter lists it; you attach copies in your own email.
          </>
        }
      >
        Your proof
      </StepTitle>
      {groups.map((g) => (
        <Box key={g} sx={{ mb: "14px" }}>
          <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: g === "best" ? tokens.greenText : tokens.textSoft, mb: "6px" }}>
            {RATING_LABEL[g]}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {EVIDENCE.filter((e) => e.rating === g).map((e) => {
              const on = state.evidence.includes(e.id);
              return (
                <Box
                  key={e.id}
                  component="label"
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    p: "10px 12px",
                    borderRadius: "10px",
                    border: `1px solid ${on ? tokens.green : tokens.border}`,
                    bgcolor: on ? tokens.greenBg : tokens.white,
                    cursor: "pointer",
                  }}
                >
                  <input type="checkbox" checked={on} onChange={() => toggle(e.id)} style={{ marginTop: 3, accentColor: tokens.green }} />
                  <Box>
                    <Box sx={{ fontWeight: 600, fontSize: "0.9rem", color: tokens.navy }}>{e.label}</Box>
                    <Box sx={{ fontSize: "0.78rem", color: tokens.textSoft }}>Proves: {e.proves}</Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
      <Callout title="Copies only">
        Send copies, never originals, and only what identifies you and proves your dates. Until the record is fixed, carry
        the same proof in your hand luggage when you travel.
      </Callout>
    </>
  );
}

// ─── 5. Details ───────────────────────────────────────────────────────────────

export function DetailsStep({ state, update, diagnosis }: StepProps) {
  const d = state.details;
  const set = (patch: Partial<typeof d>) => update({ details: { ...d, ...patch } });
  const responsible = diagnosis?.authorityCountry ?? null;
  const addressedTo = state.addressedTo ?? responsible;

  const field = (id: keyof typeof d, label: string, type = "text", autoComplete?: string) => (
    <Box>
      <FieldLabel htmlFor={`d-${id}`}>{label}</FieldLabel>
      <Box component="input" id={`d-${id}`} type={type} autoComplete={autoComplete} value={d[id]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set({ [id]: e.target.value })} sx={inputSx} />
    </Box>
  );

  return (
    <>
      <StepTitle sub="Only what the authority needs to find your record (Article 52(6)). It stays in this browser and goes into the letter, nowhere else.">
        Your details
      </StepTitle>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "12px" }}>
        {field("fullName", "Full name, as in your passport", "text", "name")}
        {field("dateOfBirth", "Date of birth", "date", "bday")}
        {field("nationality", "Nationality")}
        {field("passportNumber", "Passport number (the one you travelled on)")}
        {field("passportCountry", "Passport issued by")}
        {field("email", "Your email, for the reply", "email", "email")}
      </Box>

      <Typography component="h4" sx={{ fontFamily: tokens.fontDisplay, fontSize: "1.05rem", fontWeight: 600, color: tokens.navy, mt: "22px", mb: "8px" }}>
        Where it goes
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "12px" }}>
        <Box>
          <FieldLabel htmlFor="addr-country">Write to</FieldLabel>
          <CountrySelect id="addr-country" value={addressedTo} onChange={(v) => update({ addressedTo: v ?? null })} placeholder="Choose a country" />
        </Box>
        <Box>
          <FieldLabel htmlFor="addr-email">Authority's email (from the EU list)</FieldLabel>
          <Box component="input" id="addr-email" type="email" value={state.authorityEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ authorityEmail: e.target.value })} sx={inputSx} />
        </Box>
        {diagnosis?.flagged && (
          <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
            <FieldLabel htmlFor="border-point">Where you crossed, if you know (airport, port or road crossing)</FieldLabel>
            <Box component="input" id="border-point" value={state.borderPoint} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ borderPoint: e.target.value })} sx={inputSx} />
          </Box>
        )}
      </Box>
      <Box sx={{ mt: "12px" }}>
        <Callout>
          {responsible ? (
            <>
              {eesCountryName(responsible)} entered the crossing in question, so it's pre-selected.{" "}
            </>
          ) : (
            <>For an access request you can write to any EES country. </>
          )}
          Find its EES data contact on the EU's <ExtLink href={EU_CONTACTS_URL}>EES data and rights page</ExtLink>. If you
          write to a different country, it must pass the request on (Article 52(2)).
        </Callout>
      </Box>
    </>
  );
}

// ─── 6. Send ──────────────────────────────────────────────────────────────────

export function SendStep({ state, update, diagnosis, today }: StepProps) {
  const sendDate = state.sendDate ?? today;
  const deadline = replyDeadline(sendDate);
  const flagged = diagnosis?.flagged ?? null;
  const kind = flagged ? (state.letterKind ?? diagnosis?.letter ?? "access") : "access";
  const addressedTo = state.addressedTo ?? diagnosis?.authorityCountry ?? undefined;
  const [copied, setCopied] = useState(false);

  const letter: Letter = useMemo(() => {
    const common = {
      details: state.details,
      addressedTo: addressedTo ?? undefined,
      sendDate,
      evidence: evidenceLabels(state.evidence),
      note: state.manualNote,
      checker: diagnosis ? { arrival: state.observations[0].date, observed: diagnosis.observed, mine: diagnosis.mine } : undefined,
    };
    if (kind === "correction" && flagged) {
      return correctionLetter({
        ...common,
        crossing: {
          kind: flagged.kind === "LATE_EXIT" ? "late" : "missing",
          exitDate: flagged.trip.exit!,
          exitCountry: flagged.trip.exitCountry,
          recordedExit: flagged.recordedExit ?? undefined,
          borderPoint: state.borderPoint || undefined,
        },
      });
    }
    return accessLetter({
      ...common,
      suspects: byTrip(diagnosis?.candidates ?? []).map((c) => ({ kind: "missing" as const, exitDate: c.trip.exit!, exitCountry: c.trip.exitCountry })),
    });
  }, [state, diagnosis, kind, flagged, addressedTo, sendDate]);

  const downloadIcs = () => {
    const url = URL.createObjectURL(new Blob([deadlineCalendar(sendDate, addressedTo)], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "ees-reply-deadline.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copy = async () => {
    const text = `${letter.subject}\n\n${letter.body}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const missing = [!state.details.fullName && "your name", !state.details.passportNumber && "your passport number", !addressedTo && "the country to write to"].filter(Boolean);

  return (
    <>
      <StepTitle sub="Copy it into an email, or open it in your mail app, then attach copies of your proof.">Your letter</StepTitle>

      {flagged && (
        <Box role="radiogroup" aria-label="Letter type" sx={{ display: "flex", gap: "8px", mb: "14px", flexWrap: "wrap" }}>
          {(["correction", "access"] as const).map((k) => (
            <Box
              key={k}
              component="button"
              type="button"
              role="radio"
              aria-checked={kind === k}
              onClick={() => update({ letterKind: k })}
              sx={{
                ...inputSx,
                width: "auto",
                cursor: "pointer",
                fontWeight: 700,
                bgcolor: kind === k ? tokens.navy : tokens.white,
                color: kind === k ? tokens.white : tokens.textSoft,
                borderColor: kind === k ? tokens.navy : tokens.border,
              }}
            >
              {k === "correction" ? "Ask to correct the exit" : "Ask for my full record first"}
            </Box>
          ))}
        </Box>
      )}

      {missing.length > 0 && (
        <Box sx={{ mb: "12px" }}>
          <Callout tone="warn">Still missing: {missing.join(", ")}. Go back to Details, or fill in the gaps by hand.</Callout>
        </Box>
      )}

      <Box sx={{ border: `1px solid ${tokens.border}`, borderRadius: "12px", bgcolor: tokens.white, overflow: "hidden" }}>
        <Box sx={{ px: "14px", py: "10px", borderBottom: `1px solid ${tokens.border}`, bgcolor: tokens.mist, fontSize: "0.86rem" }}>
          <strong>Subject:</strong> {letter.subject}
        </Box>
        <Box
          component="pre"
          tabIndex={0}
          aria-label="Letter text"
          sx={{ m: 0, p: "14px", maxHeight: 420, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: tokens.fontBody, fontSize: "0.86rem", lineHeight: 1.55, color: tokens.text }}
        >
          {letter.body}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: "10px", flexWrap: "wrap", mt: "12px" }}>
        <Btn onClick={copy}>{copied ? "Copied ✓" : "Copy letter"}</Btn>
        <Btn variant="secondary" href={mailtoHref(letter, state.authorityEmail)}>
          Open in my mail app
        </Btn>
      </Box>

      <Typography component="h4" sx={{ fontFamily: tokens.fontDisplay, fontSize: "1.05rem", fontWeight: 600, color: tokens.navy, mt: "24px", mb: "8px" }}>
        After you send it
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "12px", alignItems: "end" }}>
        <Box>
          <FieldLabel htmlFor="send-date">Date you send it</FieldLabel>
          <Box component="input" type="date" id="send-date" value={sendDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => isValidDateString(e.target.value) && update({ sendDate: e.target.value })} sx={inputSx} />
        </Box>
        <Box>
          <Btn variant="secondary" onClick={downloadIcs}>
            📅 Add the deadline to my calendar
          </Btn>
        </Box>
      </Box>
      <Box sx={{ mt: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Callout tone="good" title={`Reply due by ${longDate(deadline)}`}>
          The authority has {REPLY_DEADLINE_DAYS} days from receiving your request (Article 52(1)). The calendar file adds the
          deadline and a reminder a week before. No reply by then? Contact that country's data protection authority, which
          must help you (Article 53).
        </Callout>
        <Callout title="Carry your proof">
          Until the record is fixed, keep the same proof in your hand luggage when you travel. A corrected record removes a
          false overstay; it doesn't guarantee entry.
        </Callout>
      </Box>
    </>
  );
}
