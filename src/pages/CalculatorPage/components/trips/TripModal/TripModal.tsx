import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { parseISO } from "date-fns";
import { tokens } from "@/styles/theme";
import { VisaRegion } from "@/types";
import type { Trip, Traveler, PassportRule, PassportNote } from "@/types";
import { getSchengenRule } from "@/data/regions/schengen";
import { getUKRule } from "@/data/regions/uk";
import { getIrelandRule } from "@/data/regions/ireland";
import { ValidationMessage } from "@/components/ui/ValidationMessage";
import { Button } from "@/components/ui/Button";
import { RegionSelector } from "@/components/ui/RegionSelector";
import { OngoingToggle } from "@/components/ui/OngoingToggle";
import { ImpactPreview } from "@/components/ui";
import {
  parseDate,
  formatDate,
  addDays,
  today as getToday,
} from "@/features/calculator/utils/dates";
import { calculateMaxStay } from "@/features/calculator/utils/schengen";
import {
  computeImpactBreakdown,
  computeTravelerStatus,
  getStatusVariant,
} from "../../travelers/travelerStatus";
import { getTravelerColor } from "@/features/calculator/utils/travelerColours";
import type { TravelerImpact } from "../../ImpactPreview/ImpactPreview";
import { trackEvent } from "@/utils/analytics";
import {
  assessUKStay,
  detectUKReentryRisk,
} from "@/features/calculator/utils/uk";
import type { UKStayAssessment, UKReentryRisk } from "@/features/calculator/utils/uk";
import {
  assessIrelandStay,
  detectIrelandReentryRisk,
} from "@/features/calculator/utils/ireland";
import type {
  IrelandStayAssessment,
  IrelandReentryRisk,
} from "@/features/calculator/utils/ireland";

// ─── Generic visa info section ────────────────────────────────────────────────

interface VisaInfoRow {
  traveler: Traveler;
  label: string;
  labelColor: string;
  borderColor: string;
  notes?: PassportNote[];
}

function VisaInfoSection({
  rows,
  expanded,
  onToggle,
  greenCount,
  warnCount,
  unknownCount,
  onSourceClick,
}: {
  rows: VisaInfoRow[];
  expanded: boolean;
  onToggle: () => void;
  greenCount: number;
  warnCount: number;
  unknownCount: number;
  onSourceClick: (anchor: HTMLElement, note: PassportNote) => void;
}) {
  return (
    <Box
      sx={{
        border: `1px solid ${tokens.border}`,
        borderRadius: "10px",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <Box
        onClick={onToggle}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          px: "12px",
          py: "8px",
          cursor: "pointer",
          userSelect: "none",
          borderBottom: expanded ? `1px solid ${tokens.border}` : "none",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
          <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: tokens.textSoft }}>
            Visa Status:
          </Typography>
          {greenCount > 0 && (
            <Tooltip
              title={`${greenCount} ${greenCount === 1 ? "traveler" : "travelers"} can enter without a visa`}
              placement="top"
              arrow
              componentsProps={{ tooltip: { sx: { fontFamily: tokens.fontBody, fontSize: "0.72rem", bgcolor: tokens.navy, "& .MuiTooltip-arrow": { color: tokens.navy } } } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <CheckCircleOutlineIcon sx={{ fontSize: "0.9rem", color: tokens.green }} />
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: tokens.green }}>{greenCount}</Typography>
              </Box>
            </Tooltip>
          )}
          {warnCount > 0 && (
            <Tooltip
              title={`${warnCount} ${warnCount === 1 ? "traveler requires" : "travelers require"} a visa`}
              placement="top"
              arrow
              componentsProps={{ tooltip: { sx: { fontFamily: tokens.fontBody, fontSize: "0.72rem", bgcolor: tokens.navy, "& .MuiTooltip-arrow": { color: tokens.navy } } } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <WarningAmberIcon sx={{ fontSize: "0.9rem", color: tokens.red }} />
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: tokens.red }}>{warnCount}</Typography>
              </Box>
            </Tooltip>
          )}
          {greenCount === 0 && warnCount === 0 && unknownCount > 0 && (
            <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textGhost, fontStyle: "italic" }}>
              Set nationality to see entry requirements
            </Typography>
          )}
        </Box>
        {expanded ? (
          <ExpandLessIcon sx={{ fontSize: "1rem", color: tokens.textGhost }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: "1rem", color: tokens.textGhost }} />
        )}
      </Box>

      {/* Body */}
      {expanded && (
        <Box sx={{ px: "12px", py: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {rows.map(({ traveler, label, labelColor, borderColor, notes }) => (
            <Box key={traveler.id} sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: tokens.textSoft, flexShrink: 0 }}>
                  {traveler.name}:
                </Typography>
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: labelColor, fontWeight: 500 }}>
                  {label}
                </Typography>
              </Box>
              {notes?.map((note, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: "4px", pl: "10px", borderLeft: `2px solid ${borderColor}` }}>
                  <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.67rem", color: tokens.textSoft, lineHeight: 1.5, flex: 1 }}>
                    {note.text}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => onSourceClick(e.currentTarget, note)}
                    sx={{ p: "2px", flexShrink: 0, color: tokens.textGhost, "&:hover": { color: tokens.navy, bgcolor: "transparent" } }}
                  >
                    <InfoOutlineIcon sx={{ fontSize: "0.85rem" }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripModalProps {
  open: boolean;
  mode: "add" | "edit";
  travelers: Traveler[];
  initialTravelerIds: string[];
  initialTrip?: Trip;
  onSave: (travelerIds: string[], trip: Trip) => void;
  onDelete?: () => void;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasOverlap(
  trips: Trip[],
  entry: string,
  exit: string | null,
  region: VisaRegion,
  excludeId?: string,
  excludeTrip?: Pick<Trip, "entryDate" | "exitDate" | "region">,
): string | null {
  const nEntry = parseDate(entry);
  const nExit = exit ? parseDate(exit) : new Date("2099-01-01");

  for (const t of trips) {
    if (t.id === excludeId) continue;

    if (
      excludeTrip &&
      t.entryDate === excludeTrip.entryDate &&
      t.exitDate === excludeTrip.exitDate &&
      t.region === excludeTrip.region
    ) {
      continue;
    }

    if (t.region !== region) continue;

    const tEntry = parseDate(t.entryDate);
    const tExit = t.exitDate ? parseDate(t.exitDate) : new Date("2099-01-01");

    if (nEntry < tExit && nExit > tEntry) {
      return `Overlaps with "${t.destination || t.entryDate}".`;
    }
  }
  return null;
}

function fmtHintDate(iso: string): string {
  const d = parseDate(iso);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Returns "🇺🇸 United States" style string for a given ISO Alpha-2 code */
function countryDisplay(code: string): string {
  const flag = Array.from(code.toUpperCase())
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    return `${flag} ${names.of(code) ?? code}`;
  } catch {
    return `${flag} ${code}`;
  }
}

// ─── Form label ───────────────────────────────────────────────────────────────

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component="label"
      sx={{
        display: "block",
        fontFamily: tokens.fontBody,
        fontSize: "0.68rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: tokens.textSoft,
        mb: "5px",
      }}
    >
      {children}
    </Typography>
  );
}

// ─── Shared input sx ──────────────────────────────────────────────────────────

const INPUT_SX = {
  "& .MuiOutlinedInput-root": {
    fontFamily: tokens.fontBody,
    fontSize: "0.85rem",
    bgcolor: tokens.mist,
    borderRadius: "10px",
    "& fieldset": { borderColor: tokens.border, borderWidth: 1.5 },
    "&:hover fieldset": { borderColor: tokens.navy },
    "&.Mui-focused fieldset": {
      borderColor: tokens.navy,
      borderWidth: 1.5,
      boxShadow: `0 0 0 3px rgba(12,30,60,0.06)`,
    },
  },
  "& .MuiOutlinedInput-input": {
    py: "9px",
    px: "11px",
    color: tokens.text,
    "&::placeholder": { color: tokens.textGhost, opacity: 1 },
  },
} as const;

const INPUT_ERROR_SX = {
  "& .MuiOutlinedInput-root": {
    ...INPUT_SX["& .MuiOutlinedInput-root"],
    bgcolor: tokens.redBg,
    "& fieldset": { borderColor: tokens.red, borderWidth: 1.5 },
  },
} as const;

const SELECT_BASE_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.85rem",
  bgcolor: tokens.mist,
  borderRadius: "10px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: tokens.border,
    borderWidth: 1.5,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: tokens.navy },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: tokens.navy,
    borderWidth: 1.5,
  },
  "& .MuiSelect-select": { py: "9px", px: "11px" },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function TripModal({
  open,
  mode,
  travelers,
  initialTravelerIds,
  initialTrip,
  onSave,
  onDelete,
  onClose,
}: TripModalProps) {
  // ── Form state ──────────────────────────────────────────────────────────────

  const [travelerIds, setTravelerIds] = useState<string[]>(initialTravelerIds);
  const [destination, setDestination] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [ongoing, setOngoing] = useState(false);
  const [region, setRegion] = useState<VisaRegion>(VisaRegion.Schengen);
  const [error, setError] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(mode === "edit");
  const [entryNoticeSectionExpanded, setEntryNoticeSectionExpanded] = useState(true);
  const [sourcePopover, setSourcePopover] = useState<{
    anchor: HTMLElement;
    note: PassportNote;
  } | null>(null);

  const todayStr = formatDate(getToday());

  const entryIsInFuture = Boolean(entryDate && entryDate > todayStr);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsEdit(mode === "edit");
    setTravelerIds(initialTravelerIds);
    setError(null);
    if (mode === "edit" && initialTrip) {
      setDestination(initialTrip.destination ?? "");
      setEntryDate(initialTrip.entryDate);
      setExitDate(initialTrip.exitDate ?? "");
      setOngoing(!initialTrip.exitDate);
      setRegion(initialTrip.region);
    } else {
      setDestination("");
      setEntryDate("");
      setExitDate("");
      setOngoing(false);
      setRegion(VisaRegion.Schengen);
    }
  }, [open, mode, initialTrip, initialTravelerIds]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Real-time overlap check ─────────────────────────────────────────────────
  // Runs on every render so the Save button and inline message stay in sync
  // without waiting for the user to click Save.

  const resolvedExit = ongoing ? undefined : exitDate || undefined;

  const overlapError: string | null = (() => {
    if (!open) return null;
    if (!entryDate) return null;

    const conflicts: string[] = [];
    for (const tid of travelerIds) {
      const traveler = travelers.find((t) => t.id === tid);
      if (!traveler) continue;
      const msg = hasOverlap(
        traveler.trips,
        entryDate,
        resolvedExit ?? null,
        region,
        initialTrip?.id,
        initialTrip,
      );
      if (msg) conflicts.push(`${traveler.name}: ${msg}`);
    }

    return conflicts.length > 0 ? conflicts.join("\n") : null;
  })();

  // ── Entry constraint hint ───────────────────────────────────────────────────

  let entryConstraint: { daysAvailable: number; latestExit: string } | null =
    null;

  if (entryDate && region === VisaRegion.Schengen && !exitDate && !ongoing) {
    let minDays = Infinity;
    let latestExit = "";

    for (const tid of travelerIds) {
      const traveler = travelers.find((t) => t.id === tid);
      if (!traveler) continue;

      const historicalTrips = traveler.trips.filter(
        (t) => t.region === VisaRegion.Schengen && t.id !== initialTrip?.id,
      );

      const result = calculateMaxStay(entryDate, historicalTrips);

      if (!result.canEnter) {
        entryConstraint = { daysAvailable: 0, latestExit: entryDate };
        break;
      }

      if (result.maxDays < minDays) {
        minDays = result.maxDays;
        latestExit = result.maxExitDate!;
      }
    }

    if (entryConstraint === null && isFinite(minDays) && minDays > 0) {
      entryConstraint = { daysAvailable: minDays, latestExit };
    }
  }
  // ── Impact status ───────────────────────────────────────────────────────────

  let impactStatus: ReturnType<typeof computeTravelerStatus> | null = null;

  if (entryDate && region === VisaRegion.Schengen) {
    for (const tid of travelerIds) {
      const traveler = travelers.find((t) => t.id === tid);
      if (!traveler) continue;

      const tempTrips = traveler.trips
        .filter((t) => t.id !== initialTrip?.id)
        .concat([
          {
            id: "__preview__",
            entryDate,
            exitDate: ongoing ? undefined : exitDate || undefined,
            region: VisaRegion.Schengen,
            destination,
          },
        ]);

      const tempTraveler = { ...traveler, trips: tempTrips };
      const refDate = !ongoing && exitDate ? parseDate(exitDate) : new Date();
      const status = computeTravelerStatus(tempTraveler, refDate);

      if (!impactStatus || status.daysRemaining < impactStatus.daysRemaining) {
        impactStatus = status;
      }
    }
  }

  const impactVariant = impactStatus
    ? getStatusVariant(impactStatus.daysRemaining)
    : ("neutral" as const);

  // ── Per-traveler impacts ────────────────────────────────────────────────────

  let travelerImpacts: TravelerImpact[] | undefined = undefined;

  if (travelerIds.length > 1 && entryDate && region === VisaRegion.Schengen) {
    travelerImpacts = travelerIds.flatMap((tid) => {
      const traveler = travelers.find((t) => t.id === tid);
      const travelerIndex = travelers.findIndex((t) => t.id === tid);
      if (!traveler) return [];

      const tempTrips = traveler.trips
        .filter((t) => t.id !== initialTrip?.id)
        .concat([
          {
            id: "__preview__",
            entryDate,
            exitDate: ongoing ? undefined : exitDate || undefined,
            region: VisaRegion.Schengen,
            destination,
          },
        ]);

      const tempTraveler = { ...traveler, trips: tempTrips };
      const refDate = !ongoing && exitDate ? parseDate(exitDate) : new Date();
      const status = computeTravelerStatus(tempTraveler, refDate);

      return [
        {
          id: tid,
          name: traveler.name,
          color: getTravelerColor(travelerIndex),
          daysRemaining: status.daysRemaining,
          daysUsed: status.daysUsed,
        },
      ];
    });
  }

  // ── Impact breakdown ────────────────────────────────────────────────────────

  let impactBreakdown: ReturnType<typeof computeImpactBreakdown> | undefined =
    undefined;

  if (entryDate && region === VisaRegion.Schengen && (exitDate || ongoing)) {
    let worstTraveler: Traveler | null = null;
    let worstRemaining = Infinity;

    for (const tid of travelerIds) {
      const traveler = travelers.find((t) => t.id === tid);
      if (!traveler) continue;

      const tempTrips = traveler.trips
        .filter((t) => t.id !== initialTrip?.id)
        .concat([
          {
            id: "__preview__",
            entryDate,
            exitDate: ongoing ? undefined : exitDate || undefined,
            region: VisaRegion.Schengen,
            destination,
          },
        ]);

      const tempTraveler = { ...traveler, trips: tempTrips };
      const refDate = !ongoing && exitDate ? parseDate(exitDate) : new Date();
      const status = computeTravelerStatus(tempTraveler, refDate);

      if (status.daysRemaining < worstRemaining) {
        worstRemaining = status.daysRemaining;
        worstTraveler = traveler;
      }
    }

    if (worstTraveler) {
      const historicalTrips = worstTraveler.trips.filter(
        (t) => t.region === VisaRegion.Schengen && t.id !== initialTrip?.id,
      );

      impactBreakdown = computeImpactBreakdown(
        entryDate,
        ongoing ? undefined : exitDate || undefined,
        historicalTrips,
      );
    }
  }

  const resolvedExitForPreview = ongoing ? undefined : exitDate || undefined;

  // ── Schengen entry notice data ──────────────────────────────────────────────

  const schengenTravelerData =
    region === VisaRegion.Schengen
      ? travelerIds.flatMap((tid) => {
          const t = travelers.find((x) => x.id === tid);
          if (!t) return [];
          const rule = getSchengenRule(t.passportCode);
          return [{ t, rule }];
        })
      : [];

  const schengenSafeCount = schengenTravelerData.filter(
    ({ t, rule }) =>
      t.passportCode &&
      (rule.access === "free_movement" || rule.access === "visa_free"),
  ).length;

  const schengenWarnCount = schengenTravelerData.filter(
    ({ t, rule }) =>
      t.passportCode &&
      (rule.access === "visa_required" || rule.access === "suspended"),
  ).length;

  const schengenUnknownCount = schengenTravelerData.filter(
    ({ t }) => !t.passportCode,
  ).length;

  // Null passport = treated as visa-free (default permissive). Show ImpactPreview
  // only when at least one traveler is not visa-required.
  const hasVisaFreeTravelers = schengenSafeCount > 0 || schengenUnknownCount > 0;

  // ── Visa info rows (generic, for all three regions) ─────────────────────────

  const visaInfoRows: VisaInfoRow[] = (() => {
    if (region === VisaRegion.Schengen) {
      return schengenTravelerData.map(({ t, rule }) => {
        const nat = t.passportCode ? `${countryDisplay(t.passportCode)} -- ` : "";
        if (!t.passportCode)
          return { traveler: t, label: "Set nationality to see entry requirements", labelColor: tokens.textGhost, borderColor: tokens.border, notes: undefined };
        const { label, color } =
          rule.access === "free_movement"
            ? { label: `${nat}Free movement, no day limit`, color: tokens.green }
            : rule.access === "visa_free"
              ? { label: rule.requiresETIAS ? `${nat}Visa-free entry -- ETIAS required from late 2026` : `${nat}Visa-free entry`, color: tokens.green }
              : rule.access === "suspended"
                ? { label: `${nat}Access temporarily suspended`, color: tokens.amber }
                : { label: `${nat}Schengen visa required`, color: tokens.red };
        const borderColor = color === tokens.green ? tokens.greenBorder : color === tokens.amber ? tokens.amberBorder : tokens.redBorder;
        return { traveler: t, label, labelColor: color, borderColor, notes: rule.notes };
      });
    }
    if (region === VisaRegion.UnitedKingdom) {
      return travelerIds.flatMap((tid) => {
        const t = travelers.find((x) => x.id === tid);
        if (!t) return [];
        const rule = getUKRule(t.passportCode);
        const nat = t.passportCode ? `${countryDisplay(t.passportCode)} -- ` : "";
        const { label, color } = !t.passportCode
          ? { label: "Set nationality to see entry requirements", color: tokens.textGhost }
          : rule.access === "free_movement"
            ? { label: `${nat}Free movement (Common Travel Area)`, color: tokens.green }
            : rule.access === "visa_free"
              ? { label: rule.requiresETA ? `${nat}Visa-free -- ETA required, up to 6 months` : `${nat}Visa-free, up to 6 months`, color: tokens.green }
              : rule.requiresDATV
                ? { label: `${nat}Visitor visa required -- DATV for airside transit`, color: tokens.red }
                : { label: `${nat}Visitor visa required`, color: tokens.red };
        const borderColor = color === tokens.green ? tokens.greenBorder : tokens.redBorder;
        return [{ traveler: t, label, labelColor: color, borderColor, notes: rule.notes }];
      });
    }
    if (region === VisaRegion.Ireland) {
      return travelerIds.flatMap((tid) => {
        const t = travelers.find((x) => x.id === tid);
        if (!t) return [];
        const rule = getIrelandRule(t.passportCode);
        const nat = t.passportCode ? `${countryDisplay(t.passportCode)} -- ` : "";
        const { label, color } = !t.passportCode
          ? { label: "Set nationality to see entry requirements", color: tokens.textGhost }
          : rule.access === "free_movement"
            ? { label: `${nat}Free movement, no day limit`, color: tokens.green }
            : rule.access === "visa_free"
              ? { label: `${nat}Visa-free entry, up to 90 days per permission`, color: tokens.green }
              : { label: `${nat}Ireland visa required`, color: tokens.red };
        const borderColor = color === tokens.green ? tokens.greenBorder : tokens.redBorder;
        return [{ traveler: t, label, labelColor: color, borderColor, notes: rule.notes }];
      });
    }
    return [];
  })();

  const visaInfoGreenCount = visaInfoRows.filter((r) => r.labelColor === tokens.green).length;
  const visaInfoWarnCount = visaInfoRows.filter((r) => r.labelColor === tokens.red || r.labelColor === tokens.amber).length;
  const visaInfoUnknownCount = visaInfoRows.filter((r) => r.labelColor === tokens.textGhost).length;

  // ── UK max-stay assessment ──────────────────────────────────────────────────

  const ukVisaFreeTravelers =
    region === VisaRegion.UnitedKingdom
      ? travelerIds.flatMap((tid) => {
          const t = travelers.find((x) => x.id === tid);
          if (!t) return [];
          return getUKRule(t.passportCode).access === "visa_free" ? [t] : [];
        })
      : [];

  const ukMaxStay: UKStayAssessment | null =
    entryDate && ukVisaFreeTravelers.length > 0
      ? assessUKStay(entryDate, ongoing ? undefined : exitDate || undefined)
      : null;

  const ukReentryRisk: UKReentryRisk | null =
    entryDate && ukVisaFreeTravelers.length > 0
      ? (() => {
          let worst: UKReentryRisk | null = null;
          for (const t of ukVisaFreeTravelers) {
            const ukTrips = t.trips.filter(
              (tr) =>
                tr.region === VisaRegion.UnitedKingdom &&
                tr.exitDate &&
                tr.id !== initialTrip?.id,
            );
            const risk = detectUKReentryRisk(ukTrips, entryDate);
            if (risk && (!worst || risk.variant === "danger")) worst = risk;
          }
          return worst;
        })()
      : null;

  // ── Ireland max-stay assessment ─────────────────────────────────────────────

  const irelandVisaFreeTravelers =
    region === VisaRegion.Ireland
      ? travelerIds.flatMap((tid) => {
          const t = travelers.find((x) => x.id === tid);
          if (!t) return [];
          return getIrelandRule(t.passportCode).access === "visa_free" ? [t] : [];
        })
      : [];

  const irelandMaxStay: IrelandStayAssessment | null =
    entryDate && irelandVisaFreeTravelers.length > 0
      ? assessIrelandStay(entryDate, ongoing ? undefined : exitDate || undefined)
      : null;

  const irelandReentryRisk: IrelandReentryRisk | null =
    entryDate && irelandVisaFreeTravelers.length > 0
      ? (() => {
          let worst: IrelandReentryRisk | null = null;
          for (const t of irelandVisaFreeTravelers) {
            const irelandTrips = t.trips.filter(
              (tr) =>
                tr.region === VisaRegion.Ireland &&
                tr.exitDate &&
                tr.id !== initialTrip?.id,
            );
            const risk = detectIrelandReentryRisk(irelandTrips, entryDate);
            if (risk && (!worst || risk.variant === "danger")) worst = risk;
          }
          return worst;
        })()
      : null;

  // ── Validation & submit ─────────────────────────────────────────────────────

  function handleSave() {
    if (travelerIds.length === 0) {
      setError("Please select at least one traveler.");
      return;
    }
    if (!entryDate) {
      setError("Please enter an entry date.");
      return;
    }
    if (!ongoing && exitDate && exitDate < entryDate) {
      setError("Exit date must be after entry date.");
      return;
    }
    // overlapError is already shown inline — guard here as a safety net
    if (overlapError) return;

    if (impactStatus && impactStatus.daysRemaining < 0) {
      trackEvent("overstay_warning_shown", {
        days_over: Math.abs(impactStatus.daysRemaining),
      });
    }

    const trip: Trip = {
      id: initialTrip?.id ?? crypto.randomUUID(),
      entryDate,
      exitDate: resolvedExit,
      region,
      destination: destination.trim() || undefined,
    };

    onSave(travelerIds, trip);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (
      e.key === "Enter" &&
      !(e.target as HTMLElement).tagName.match(/SELECT/i)
    ) {
      handleSave();
    }
    if (e.key === "Escape") onClose();
  }

  const isSaveDisabled = Boolean(overlapError);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "20px",
              width: 420,
              maxWidth: "calc(100vw - 32px)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              maxHeight: "85vh",
              boxShadow: "0 12px 40px rgba(12,30,60,0.18)",
            },
          },
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            px: "20px",
            pt: "18px",
            pb: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fontDisplay,
              fontSize: "1.1rem",
              fontStyle: "italic",
              fontWeight: 400,
              color: tokens.navy,
            }}
          >
            {isEdit ? "Edit trip" : "Add a trip"}
          </Typography>
          <Box
            component="button"
            onClick={onClose}
            sx={{
              width: 26,
              height: 26,
              border: "none",
              borderRadius: "5px",
              bgcolor: tokens.mist,
              color: tokens.textSoft,
              cursor: "pointer",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
              "&:hover": { bgcolor: tokens.redBg, color: tokens.red },
            }}
          >
            ✕
          </Box>
        </Box>

        {/* ── Body ── */}
        <Box
          sx={{
            pl: "20px",
            pr: "14px",
            mr: "6px",
            py: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflowY: "scroll",
            "&::-webkit-scrollbar": { width: "5px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: tokens.border,
              borderRadius: "4px",
              border: "1px solid transparent",
            },
          }}
          onKeyDown={handleKeyDown}
        >
          {/* Validation error (non-overlap) */}
          {error && (
            <ValidationMessage variant="error" sx={{ whiteSpace: "pre-line" }}>
              {error}
            </ValidationMessage>
          )}

          {/* Real-time overlap error */}
          {overlapError && (
            <ValidationMessage variant="error" sx={{ whiteSpace: "pre-line" }}>
              {overlapError}
            </ValidationMessage>
          )}

          {/* 1 · Traveler selector — editable in both add and edit modes */}
          <Box>
            <FormLabel>Traveler(s)</FormLabel>
            <Select
              multiple
              value={travelerIds}
              onChange={(e) => {
                const val = e.target.value;
                setTravelerIds(typeof val === "string" ? val.split(",") : val);
                setError(null);
              }}
              fullWidth
              size="small"
              displayEmpty
              renderValue={(selected) => {
                if ((selected as string[]).length === 0) {
                  return (
                    <Typography
                      sx={{
                        fontFamily: tokens.fontBody,
                        fontSize: "0.85rem",
                        color: tokens.textGhost,
                      }}
                    >
                      Select travelers…
                    </Typography>
                  );
                }
                return (selected as string[])
                  .map((id) => travelers.find((t) => t.id === id)?.name ?? id)
                  .join(", ");
              }}
              sx={SELECT_BASE_SX}
            >
              {travelers.map((t) => {
                const alreadyOnTrip =
                  isEdit && initialTravelerIds.includes(t.id);
                return (
                  <MenuItem
                    key={t.id}
                    value={t.id}
                    sx={{ fontFamily: tokens.fontBody, fontSize: "0.85rem" }}
                  >
                    <Checkbox
                      checked={travelerIds.includes(t.id)}
                      size="small"
                      sx={{ p: "2px", mr: "6px", color: tokens.border }}
                    />
                    <ListItemText
                      primary={t.name}
                      secondary={
                        alreadyOnTrip ? "Already on this trip" : undefined
                      }
                      primaryTypographyProps={{
                        fontFamily: tokens.fontBody,
                        fontSize: "0.85rem",
                      }}
                      secondaryTypographyProps={{
                        fontFamily: tokens.fontBody,
                        fontSize: "0.68rem",
                        color: tokens.textGhost,
                      }}
                    />
                  </MenuItem>
                );
              })}
            </Select>
          </Box>

          {/* 2 · Region */}
          <Box>
            <FormLabel>Region</FormLabel>
            <RegionSelector
              value={region}
              onChange={(r) => {
                setRegion(r);
                setError(null);
              }}
            />
          </Box>

          {/* 2b/2c/2d · Nationality entry notice — generic for all regions */}
          {visaInfoRows.length > 0 && (
            <VisaInfoSection
              rows={visaInfoRows}
              expanded={entryNoticeSectionExpanded}
              onToggle={() => setEntryNoticeSectionExpanded((v) => !v)}
              greenCount={visaInfoGreenCount}
              warnCount={visaInfoWarnCount}
              unknownCount={visaInfoUnknownCount}
              onSourceClick={(anchor, note) => setSourcePopover({ anchor, note })}
            />
          )}

          {/* Source info popover */}
          <Popover
            open={Boolean(sourcePopover)}
            anchorEl={sourcePopover?.anchor}
            onClose={() => setSourcePopover(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: "10px",
                  p: "12px 14px",
                  boxShadow: "0 4px 20px rgba(12,30,60,0.15)",
                  maxWidth: 300,
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                },
              },
            }}
          >
            {sourcePopover && (
              <>
                <Box
                  component="a"
                  href={sourcePopover.note.source.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    fontFamily: tokens.fontBody,
                    fontSize: "0.72rem",
                    color: tokens.navy,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Direct source ↗
                </Box>
                <Box
                  component="a"
                  href={sourcePopover.note.source.parentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    fontFamily: tokens.fontBody,
                    fontSize: "0.72rem",
                    color: tokens.navy,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Overview page ↗
                </Box>
                <Typography
                  sx={{
                    fontFamily: tokens.fontBody,
                    fontSize: "0.67rem",
                    color: tokens.textSoft,
                    mt: "2px",
                  }}
                >
                  Last verified: {sourcePopover.note.source.dateChecked}
                </Typography>
              </>
            )}
          </Popover>

          {/* 3 · Trip name */}
          <Box>
            <FormLabel>Trip name</FormLabel>
            <TextField
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Paris & Barcelona"
              fullWidth
              autoFocus={!isEdit}
              inputProps={{ maxLength: 60 }}
              sx={INPUT_SX}
            />
          </Box>

          {/* 4 · Dates */}
          <Box>
            <FormLabel>Dates</FormLabel>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                mb: "6px",
              }}
            >
              <DatePicker
                value={entryDate ? parseISO(entryDate) : null}
                onChange={(date) => {
                  if (!date) return;
                  const iso = formatDate(date);
                  setEntryDate(iso);
                  if (iso > todayStr && ongoing) {
                    setOngoing(false);
                  }
                  if (!ongoing) {
                    if (!exitDate || exitDate <= iso) {
                      setExitDate(formatDate(addDays(date, 1)));
                    }
                  }
                  setError(null);
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    placeholder: "Entry",
                    sx: error && !entryDate ? INPUT_ERROR_SX : INPUT_SX,
                  },
                }}
              />
              <DatePicker
                value={exitDate ? parseISO(exitDate) : null}
                disabled={ongoing || !entryDate}
                minDate={entryDate ? parseISO(entryDate) : undefined}
                onChange={(date) => {
                  if (!date) return;
                  setExitDate(formatDate(date));
                  setError(null);
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    placeholder: "Exit",
                    sx: {
                      ...(ongoing || !entryDate ? { opacity: 0.5 } : {}),
                      ...INPUT_SX,
                    },
                  },
                }}
              />
            </Box>

            <Tooltip
              title={
                entryIsInFuture
                  ? "Ongoing trips require an entry date on or before today"
                  : ""
              }
              placement="top"
              arrow
              disableHoverListener={!entryIsInFuture}
              componentsProps={{
                tooltip: {
                  sx: {
                    fontFamily: tokens.fontBody,
                    fontSize: "0.72rem",
                    bgcolor: tokens.navy,
                    "& .MuiTooltip-arrow": { color: tokens.navy },
                  },
                },
              }}
            >
              <Box
                sx={{
                  display: "inline-block",
                  pointerEvents: entryIsInFuture ? "none" : "auto",
                  opacity: entryIsInFuture ? 0.4 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                <OngoingToggle
                  checked={ongoing}
                  label={
                    region === VisaRegion.Schengen ? "Currently inside Schengen (no exit yet)" :
                    region === VisaRegion.UnitedKingdom ? "Currently in the UK (no exit yet)" :
                    region === VisaRegion.Ireland ? "Currently in Ireland (no exit yet)" :
                    "Currently travelling (no exit date yet)"
                  }
                  onChange={(v) => {
                    setOngoing(v);
                    if (v) setExitDate("");
                    setError(null);
                  }}
                />
              </Box>
            </Tooltip>
          </Box>

          {/* Entry constraint hint */}
          {entryConstraint && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: "12px",
                py: "9px",
                bgcolor: tokens.mist,
                border: `1px solid ${tokens.border}`,
                borderRadius: "10px",
              }}
            >
              {entryConstraint.daysAvailable === 0 ? (
                <Typography
                  sx={{
                    fontFamily: tokens.fontBody,
                    fontSize: "0.75rem",
                    color: tokens.red,
                    fontWeight: 600,
                  }}
                >
                  No days available — entry not possible on this date.
                </Typography>
              ) : (
                <>
                  <Typography
                    sx={{
                      fontFamily: tokens.fontBody,
                      fontSize: "0.75rem",
                      color: tokens.textSoft,
                      fontWeight: 500,
                    }}
                  >
                    {entryConstraint.daysAvailable === 1
                      ? "1 day available"
                      : `${entryConstraint.daysAvailable} days available`}
                    {travelerIds.length > 1 && " (most constrained)"}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: tokens.fontBody,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: tokens.navy,
                      ml: "8px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Latest exit: {fmtHintDate(entryConstraint.latestExit)}
                  </Typography>
                </>
              )}
            </Box>
          )}

          {/* Impact preview */}
          {region === VisaRegion.Schengen &&
            entryDate &&
            (exitDate || ongoing) &&
            impactStatus &&
            hasVisaFreeTravelers && (
              <ImpactPreview
                daysRemaining={impactStatus.daysRemaining}
                daysUsed={impactStatus.daysUsed}
                variant={impactVariant}
                breakdown={impactBreakdown}
                travelerImpacts={travelerImpacts}
                currentTripEntry={entryDate}
                currentTripExit={resolvedExitForPreview}
              />
            )}

          {/* Visa-required disclaimer — shown when no visa-free travelers are selected */}
          {region === VisaRegion.Schengen &&
            schengenWarnCount > 0 &&
            !hasVisaFreeTravelers &&
            entryDate &&
            (exitDate || ongoing) && (
              <Typography
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.75rem",
                  fontStyle: "italic",
                  color: tokens.textGhost,
                  px: "20px",
                  pb: "12px",
                }}
              >
                Day tracking isn't available yet for Schengen visa holders as allowances depend on the specific visa granted.
              </Typography>
            )}

          {/* UK max-stay warning — same position as Schengen ImpactPreview */}
          {ukMaxStay && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                px: "12px",
                py: "9px",
                bgcolor:
                  ukMaxStay.variant === "danger"
                    ? "rgba(220,38,38,0.06)"
                    : ukMaxStay.variant === "caution"
                      ? tokens.amberBg
                      : tokens.mist,
                border: `1px solid ${
                  ukMaxStay.variant === "danger"
                    ? tokens.red
                    : ukMaxStay.variant === "caution"
                      ? tokens.amberBorder
                      : tokens.border
                }`,
                borderRadius: "10px",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.75rem", color: tokens.textSoft, fontWeight: 500 }}>
                  {ukMaxStay.variant === "danger" && ukMaxStay.daysRemaining < 0
                    ? `Over the 6-month limit by ${Math.abs(ukMaxStay.daysRemaining)} day${Math.abs(ukMaxStay.daysRemaining) === 1 ? "" : "s"}`
                    : `${ukMaxStay.tripDays} day${ukMaxStay.tripDays === 1 ? "" : "s"} of 6-month visit`}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: tokens.fontBody,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: ukMaxStay.variant === "danger" ? tokens.red : ukMaxStay.variant === "caution" ? tokens.amberText : tokens.navy,
                    whiteSpace: "nowrap",
                  }}
                >
                  Latest exit: {fmtHintDate(ukMaxStay.maxExitDate)}
                </Typography>
              </Box>
              {ukMaxStay.variant !== "safe" && (
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: "5px" }}>
                  <WarningAmberIcon sx={{ fontSize: "0.85rem", mt: "1px", flexShrink: 0, color: ukMaxStay.variant === "danger" ? tokens.red : tokens.amberText }} />
                  <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: ukMaxStay.variant === "danger" ? tokens.red : tokens.amberText, lineHeight: 1.4 }}>
                    {ukMaxStay.variant === "danger"
                      ? "This trip exceeds the 6-month visit limit. Border Force may deny entry or curtail leave."
                      : "Approaching the 6-month visit limit. Leave time before the deadline."}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* UK re-entry risk — below max-stay box */}
          {ukReentryRisk && (() => {
            const isRed = ukReentryRisk.variant === "danger";
            const isAmber = ukReentryRisk.variant === "caution";
            const bg = isRed ? "rgba(220,38,38,0.06)" : isAmber ? tokens.amberBg : tokens.greenBg;
            const borderColor = isRed ? tokens.red : isAmber ? tokens.amberBorder : tokens.greenBorder;
            const textColor = isRed ? tokens.red : isAmber ? tokens.amberText : tokens.greenText;
            const heading = isRed
              ? "Re-entry after a long UK stay — high scrutiny"
              : isAmber
                ? "Previous long UK stay on record"
                : "Previous UK stay noted";
            const body = isRed
              ? `Your last UK trip lasted ${ukReentryRisk.lastTripDays} days, exiting only ${ukReentryRisk.daysSinceExit} days ago. Immediate re-entry after a near-maximum stay is likely to be refused under the genuine visitor test.`
              : isAmber
                ? `Your last UK trip lasted ${ukReentryRisk.lastTripDays} days. Border Force may scrutinise this entry — carry evidence of ties to your home country and clear reasons for returning.`
                : `A previous UK trip of ${ukReentryRisk.lastTripDays} days is on record. This entry is unlikely to cause issues, but be ready to explain your travel pattern if asked.`;
            return (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: "6px", px: "12px", py: "9px", bgcolor: bg, border: `1px solid ${borderColor}`, borderRadius: "10px" }}>
                <WarningAmberIcon sx={{ fontSize: "0.85rem", mt: "2px", flexShrink: 0, color: textColor }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: textColor }}>{heading}</Typography>
                  <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textSoft, lineHeight: 1.4 }}>{body}</Typography>
                </Box>
              </Box>
            );
          })()}

          {/* Ireland max-stay warning — same position as Schengen ImpactPreview */}
          {irelandMaxStay && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                px: "12px",
                py: "9px",
                bgcolor:
                  irelandMaxStay.variant === "danger"
                    ? "rgba(220,38,38,0.06)"
                    : irelandMaxStay.variant === "caution"
                      ? tokens.amberBg
                      : tokens.mist,
                border: `1px solid ${
                  irelandMaxStay.variant === "danger"
                    ? tokens.red
                    : irelandMaxStay.variant === "caution"
                      ? tokens.amberBorder
                      : tokens.border
                }`,
                borderRadius: "10px",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.75rem", color: tokens.textSoft, fontWeight: 500 }}>
                  {irelandMaxStay.variant === "danger" && irelandMaxStay.daysRemaining < 0
                    ? `Over the 90-day limit by ${Math.abs(irelandMaxStay.daysRemaining)} day${Math.abs(irelandMaxStay.daysRemaining) === 1 ? "" : "s"}`
                    : `${irelandMaxStay.tripDays} day${irelandMaxStay.tripDays === 1 ? "" : "s"} of 90-day permission`}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: tokens.fontBody,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: irelandMaxStay.variant === "danger" ? tokens.red : irelandMaxStay.variant === "caution" ? tokens.amberText : tokens.navy,
                    whiteSpace: "nowrap",
                  }}
                >
                  Latest exit: {fmtHintDate(irelandMaxStay.maxExitDate)}
                </Typography>
              </Box>
              {irelandMaxStay.variant !== "safe" && (
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: "5px" }}>
                  <WarningAmberIcon sx={{ fontSize: "0.85rem", mt: "1px", flexShrink: 0, color: irelandMaxStay.variant === "danger" ? tokens.red : tokens.amberText }} />
                  <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: irelandMaxStay.variant === "danger" ? tokens.red : tokens.amberText, lineHeight: 1.4 }}>
                    {irelandMaxStay.variant === "danger"
                      ? "This trip exceeds the 90-day permission limit. You may be asked to leave."
                      : "Approaching the 90-day permission limit. Plan an exit date before the deadline."}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Ireland re-entry risk — below max-stay box */}
          {irelandReentryRisk && (() => {
            const isRed = irelandReentryRisk.variant === "danger";
            const isAmber = irelandReentryRisk.variant === "caution";
            const bg = isRed ? "rgba(220,38,38,0.06)" : isAmber ? tokens.amberBg : tokens.greenBg;
            const borderColor = isRed ? tokens.red : isAmber ? tokens.amberBorder : tokens.greenBorder;
            const textColor = isRed ? tokens.red : isAmber ? tokens.amberText : tokens.greenText;
            const heading = isRed
              ? "Re-entry after a maximum-duration Ireland stay — entry may be refused"
              : isAmber
                ? "Previous long Ireland stay on record"
                : "Previous Ireland stay noted";
            const body = isRed
              ? `Your last Ireland trip lasted ${irelandReentryRisk.lastTripDays} days, exiting only ${irelandReentryRisk.daysSinceExit} days ago. INIS has explicitly stated that immediate re-entry after a maximum-duration stay is not permitted.`
              : isAmber
                ? `Your last Ireland trip lasted ${irelandReentryRisk.lastTripDays} days. Officers may scrutinise this entry — carry evidence of your home ties and clear reasons for visiting.`
                : `A previous Ireland trip of ${irelandReentryRisk.lastTripDays} days is on record. This entry is unlikely to cause issues, but be prepared to explain your travel pattern.`;
            return (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: "6px", px: "12px", py: "9px", bgcolor: bg, border: `1px solid ${borderColor}`, borderRadius: "10px" }}>
                <WarningAmberIcon sx={{ fontSize: "0.85rem", mt: "2px", flexShrink: 0, color: textColor }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: textColor }}>{heading}</Typography>
                  <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textSoft, lineHeight: 1.4 }}>{body}</Typography>
                </Box>
              </Box>
            );
          })()}
        </Box>

        {/* ── Divider ── */}
        <Box sx={{ height: 1, bgcolor: tokens.border }} />

        {/* ── Footer ── */}
        <Box sx={{ px: "20px", py: "16px", display: "flex", gap: "7px" }}>
          {isEdit && onDelete && (
            <Button variant="danger" onClick={onDelete} sx={{ mr: "auto" }}>
              Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>
            Cancel
          </Button>
          <Button
            // variant="primary"
            onClick={handleSave}
            disabled={isSaveDisabled}
            sx={{ flex: 2 }}
          >
            {isSaveDisabled ? "Overlap detected" : "Save Trip"}
          </Button>
        </Box>
      </Dialog>
    </LocalizationProvider>
  );
}
