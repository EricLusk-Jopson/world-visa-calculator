import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { tokens } from "@/styles/theme";

/**
 * Status of a traveler's stay duration:
 *   safe      — within the allowance (green clock)
 *   caution   — approaching the limit (amber clock)
 *   danger    — over the limit / refused (red warning)
 *   untracked — visa-required, no automatic tracking (grey question)
 *   pending   — no trip dates yet (muted clock)
 */
export type DurationState = "safe" | "caution" | "danger" | "untracked" | "pending";

export function durationColor(state: DurationState): string {
  switch (state) {
    case "safe":
      return tokens.green;
    case "caution":
      return tokens.amber;
    case "danger":
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
  if (state === "untracked")
    return <HelpOutlineIcon sx={{ fontSize: size, color }} />;
  if (state === "danger")
    return <WarningAmberIcon sx={{ fontSize: size, color }} />;
  // safe / caution / pending → circled clock
  return <AccessTimeIcon sx={{ fontSize: size, color }} />;
}
