import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HomeIcon from "@mui/icons-material/Home";
import { tokens } from "@/styles/theme";

/**
 * Status of a traveler's stay duration:
 *   safe      — comfortably within the allowance (green clock)
 *   caution   — approaching the limit (amber clock)
 *   danger    — close to the limit but still legal (red clock)
 *   overstay  — over the limit / refused (red warning)
 *   untracked — visa-required, no automatic tracking (grey question)
 *   pending   — no trip dates yet (muted clock)
 *   home      — free movement: a national of the destination (or an EU/EEA
 *               citizen inside the bloc) — no day limit applies at all,
 *               never a "no data yet" or "unknown" state (green home icon)
 */
export type DurationState =
  | "safe"
  | "caution"
  | "danger"
  | "overstay"
  | "untracked"
  | "pending"
  | "home";

export function durationColor(state: DurationState): string {
  switch (state) {
    case "safe":
    case "home":
      return tokens.green;
    case "caution":
      return tokens.amber;
    case "danger":
    case "overstay":
      return tokens.red;
    case "untracked":
    case "pending":
      return tokens.textGhost;
  }
}

export function DurationIcon({
  state,
  size = "1.1rem",
}: {
  state: DurationState;
  size?: string | number;
}) {
  const color = durationColor(state);
  if (state === "home")
    return <HomeIcon sx={{ fontSize: size, color }} />;
  if (state === "untracked")
    return <HelpOutlineIcon sx={{ fontSize: size, color }} />;
  if (state === "overstay")
    return <WarningAmberIcon sx={{ fontSize: size, color }} />;
  // safe / caution / danger / pending → circled clock (red when danger)
  return <AccessTimeIcon sx={{ fontSize: size, color }} />;
}
