import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { tokens } from "@/styles/theme";
import { DurationIcon, type DurationState } from "./DurationIcon";

/**
 * What each trip status icon means. One list feeds the icons' tooltips and
 * the icon guide inside them, so an icon and its explanation can't drift.
 *
 * Entry eligibility:
 *   ok        — entry without a visa, or free movement (green check)
 *   temporary — allowed under a time-limited waiver covering the trip (green clock)
 *   nearby    — a waiver applies near the trip's dates but not on them (red clock)
 *   visa      — visa required (red warning)
 *   unknown   — nationality not set (grey question)
 * Stay duration: see DurationState.
 */
export type EligibilityState = "ok" | "temporary" | "nearby" | "visa" | "unknown";

export type StatusKind = "eligibility" | "duration";

export type StatusState<K extends StatusKind> = K extends "eligibility" ? EligibilityState : DurationState;

export interface LegendEntry {
  label: string;
  description: string;
  icon: (size: string) => React.ReactNode;
}

export const ELIGIBILITY_LEGEND: Record<EligibilityState, LegendEntry> = {
  ok: {
    label: "Entry allowed",
    description: "No visa needed for this trip.",
    icon: (size) => <CheckCircleOutlineIcon sx={{ fontSize: size, color: tokens.green }} />,
  },
  temporary: {
    label: "Allowed for now",
    description: "A time-limited visa waiver covers this trip's dates.",
    icon: (size) => <AccessTimeIcon sx={{ fontSize: size, color: tokens.green }} />,
  },
  nearby: {
    label: "Waiver not in effect",
    description: "A visa waiver applies before or after this trip, but not on its dates.",
    icon: (size) => <AccessTimeIcon sx={{ fontSize: size, color: tokens.red }} />,
  },
  visa: {
    label: "Visa required",
    description: "A visa is needed before travelling.",
    icon: (size) => <WarningAmberIcon sx={{ fontSize: size, color: tokens.red }} />,
  },
  unknown: {
    label: "Nationality not set",
    description: "Set the traveler's passport to check entry.",
    icon: (size) => <HelpOutlineIcon sx={{ fontSize: size, color: tokens.textGhost }} />,
  },
};

export const DURATION_LEGEND: Record<DurationState, LegendEntry> = {
  safe: {
    label: "Within the limit",
    description: "The stay fits comfortably in the allowance.",
    icon: (size) => <DurationIcon state="safe" size={size} />,
  },
  caution: {
    label: "Approaching the limit",
    description: "Few days left in the allowance.",
    icon: (size) => <DurationIcon state="caution" size={size} />,
  },
  danger: {
    label: "At the limit",
    description: "Still legal, but at or near the maximum, or a quick re-entry after a long stay.",
    icon: (size) => <DurationIcon state="danger" size={size} />,
  },
  overstay: {
    label: "Over the limit",
    description: "The stay exceeds the allowance.",
    icon: (size) => <DurationIcon state="overstay" size={size} />,
  },
  untracked: {
    label: "Not tracked",
    description: "Visa required: the allowance depends on the visa granted.",
    icon: (size) => <DurationIcon state="untracked" size={size} />,
  },
  home: {
    label: "Free movement",
    description: "No day limit applies.",
    icon: (size) => <DurationIcon state="home" size={size} />,
  },
  pending: {
    label: "No dates yet",
    description: "Add trip dates to see stay duration.",
    icon: (size) => <DurationIcon state="pending" size={size} />,
  },
};

export function legendEntry<K extends StatusKind>(kind: K, state: StatusState<K>): LegendEntry {
  return kind === "eligibility"
    ? ELIGIBILITY_LEGEND[state as EligibilityState]
    : DURATION_LEGEND[state as DurationState];
}
