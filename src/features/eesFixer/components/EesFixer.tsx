/**
 * EES Record Fixer: the six-step flow, one component for both surfaces (the
 * /ees-record-fixer landing page and the dialog in /app).
 *
 * Trips are the calculator's own: the fixer reads the chosen traveler's
 * Schengen trips and writes edits straight back through onTravelersChange.
 * Everything else lives in fixer storage (storage.ts), saved after every
 * change so the traveller can leave and come back.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { VisaRegion, type Traveler, type Trip } from "@/types";
import { tokens } from "@/styles/theme";
import { todayISO, isValidDateString } from "@/features/calculator/utils/dates";
import { trackEvent } from "@/utils/analytics";
import { diagnose, resolveTrips, type Diagnosis } from "../engine";
import { MAX_PROBES } from "../constants";
import {
  clearFixerState,
  INITIAL_STATE,
  loadFixerState,
  saveFixerState,
  type FixerState,
} from "../storage";
import { Btn } from "./ui";
import { STEP, STEPS, toFixerTrips } from "./flow";
import { ProblemStep, TripsStep, DiagnosisStep, ProofStep, DetailsStep, SendStep } from "./steps";

export interface EesFixerProps {
  travelers: Traveler[];
  onTravelersChange: (next: Traveler[]) => void;
  surface: "landing" | "app";
  /** Open at this step (the app's "fewer days than this?" prompt opens at Diagnosis). */
  initialStep?: number;
  /** Work on this traveler. */
  initialTravelerId?: string;
}

export function EesFixer({ travelers, onTravelersChange, surface, initialStep, initialTravelerId }: EesFixerProps) {
  const [state, setState] = useState<FixerState>(() => {
    const saved = loadFixerState();
    const next = { ...saved };
    if (initialTravelerId) next.travelerId = initialTravelerId;
    if (initialStep !== undefined) {
      next.step = initialStep;
      if (initialStep >= STEP.diagnosis && !next.problem) next.problem = "zero_days";
    }
    return next;
  });
  const [cleared, setCleared] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const today = todayISO();

  useEffect(() => saveFixerState(state), [state]);

  const update = (patch: Partial<FixerState>) => setState((s) => ({ ...s, ...patch }));

  const traveler = travelers.find((t) => t.id === state.travelerId) ?? travelers[0] ?? null;
  const fixerTrips = useMemo(
    () => toFixerTrips(traveler?.trips ?? [], state.tripCountries),
    [traveler, state.tripCountries],
  );
  const record = useMemo(() => resolveTrips(fixerTrips, today).record, [fixerTrips, today]);

  const observations = state.observations.filter(
    (o): o is { date: string; remaining: number } => isValidDateString(o.date) && o.remaining !== null && o.remaining >= 0 && o.remaining <= 90,
  );
  // Probe results only count once the arrival result is in.
  const firstValid = observations.length > 0 && observations[0].date === state.observations[0].date;
  const diagnosis: Diagnosis | null = useMemo(
    () => (firstValid ? diagnose({ trips: fixerTrips, observations, today }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firstValid, fixerTrips, JSON.stringify(observations), today],
  );

  // ── Analytics: step reached and verdict type only, never dates or countries.
  useEffect(() => {
    trackEvent("fixer_step", { step: STEPS[state.step], surface });
  }, [state.step, surface]);
  const lastVerdict = useRef<string | null>(null);
  useEffect(() => {
    const v = diagnosis?.verdict ?? null;
    if (v && v !== lastVerdict.current) trackEvent("fixer_verdict", { verdict: v, surface });
    lastVerdict.current = v;
  }, [diagnosis?.verdict, surface]);

  // ── Trips: written back to the calculator.
  const setSchengenTrips = (next: Trip[]) => {
    if (traveler) {
      onTravelersChange(
        travelers.map((t) =>
          t.id === traveler.id ? { ...t, trips: [...t.trips.filter((x) => x.region !== VisaRegion.Schengen), ...next] } : t,
        ),
      );
    } else {
      const created: Traveler = { id: crypto.randomUUID(), name: "Me", passportCode: null, trips: next };
      onTravelersChange([created]);
      update({ travelerId: created.id });
    }
  };

  const goTo = (step: number) => {
    update({ step });
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const canContinue = (() => {
    switch (state.step) {
      case STEP.problem:
        return state.problem !== null;
      case STEP.trips:
        return true;
      case STEP.diagnosis:
        return diagnosis !== null && diagnosis.letter !== null;
      default:
        return true;
    }
  })();

  const deleteMyData = () => {
    clearFixerState();
    setState({ ...INITIAL_STATE, travelerId: state.travelerId });
    setCleared(true);
    trackEvent("fixer_data_deleted", { surface });
  };

  const stepProps = { state, update, diagnosis, today, record, fixerTrips, surface };

  return (
    <Box ref={topRef} sx={{ fontFamily: tokens.fontBody, color: tokens.text, scrollMarginTop: "80px" }}>
      <Progress step={state.step} onJump={(i) => i < state.step && goTo(i)} />

      <Box sx={{ px: { xs: "16px", sm: "24px" }, py: "22px" }}>
        {state.step === STEP.problem && <ProblemStep {...stepProps} />}
        {state.step === STEP.trips && (
          <TripsStep
            {...stepProps}
            travelers={travelers}
            traveler={traveler}
            schengenTrips={(traveler?.trips ?? []).filter((t) => t.region === VisaRegion.Schengen)}
            onTripsChange={setSchengenTrips}
          />
        )}
        {state.step === STEP.diagnosis && <DiagnosisStep {...stepProps} maxProbes={MAX_PROBES} />}
        {state.step === STEP.proof && <ProofStep {...stepProps} />}
        {state.step === STEP.details && <DetailsStep {...stepProps} />}
        {state.step === STEP.send && <SendStep {...stepProps} />}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          px: { xs: "16px", sm: "24px" },
          py: "14px",
          borderTop: `1px solid ${tokens.border}`,
        }}
      >
        {state.step > 0 ? (
          <Btn variant="secondary" onClick={() => goTo(state.step - 1)}>
            ← Back
          </Btn>
        ) : (
          <span />
        )}
        {state.step < STEPS.length - 1 && (
          <Btn onClick={() => goTo(state.step + 1)} disabled={!canContinue}>
            Next →
          </Btn>
        )}
      </Box>

      <Box
        sx={{
          px: { xs: "16px", sm: "24px" },
          py: "12px",
          bgcolor: tokens.mist,
          borderTop: `1px solid ${tokens.border}`,
          fontSize: "0.78rem",
          color: tokens.textSoft,
          lineHeight: 1.5,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { sm: "center" },
          gap: "10px",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <strong>Private:</strong> your answers stay in this browser so you can come back later. Nothing is sent to us.
          {surface === "landing" && " Your trips are saved to your calculator on this device."} On a shared computer, delete
          your data when you finish. This tool is not legal advice, and only a border guard decides whether you may enter.
          {cleared && (
            <Box component="span" role="status" sx={{ display: "block", color: tokens.greenText, fontWeight: 700, mt: "4px" }}>
              Your fixer data was deleted from this browser.
            </Box>
          )}
        </Box>
        <Btn variant="danger" onClick={deleteMyData}>
          Delete my data
        </Btn>
      </Box>
    </Box>
  );
}

function Progress({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <Box
      component="ol"
      aria-label="Progress"
      sx={{
        display: "flex",
        listStyle: "none",
        m: 0,
        px: { xs: "10px", sm: "24px" },
        py: "14px",
        gap: { xs: "2px", sm: "6px" },
        bgcolor: tokens.mist,
        borderBottom: `1px solid ${tokens.border}`,
      }}
    >
      {STEPS.map((label, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <Box component="li" key={label} sx={{ flex: 1, minWidth: 0 }} aria-current={current ? "step" : undefined}>
            <Box
              component="button"
              type="button"
              onClick={() => onJump(i)}
              disabled={!done}
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                border: "none",
                bgcolor: "transparent",
                p: 0,
                cursor: done ? "pointer" : "default",
                fontFamily: tokens.fontBody,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  bgcolor: current ? tokens.navy : done ? tokens.green : tokens.white,
                  color: current || done ? tokens.white : tokens.textSoft,
                  border: `1px solid ${current ? tokens.navy : done ? tokens.green : tokens.border}`,
                }}
              >
                {done ? "✓" : i + 1}
              </Box>
              <Typography
                component="span"
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: { xs: "0.62rem", sm: "0.74rem" },
                  fontWeight: current ? 700 : 500,
                  color: current ? tokens.navy : tokens.textSoft,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
                {label}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
