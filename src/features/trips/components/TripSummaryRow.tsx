import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { tokens } from "@/styles/theme";
import { StatusTip } from "@/components/ui/StatusTip";
import { legendEntry, type StatusKind, type StatusState } from "@/components/ui/statusLegend";

export interface TripSummaryRowProps {
  label: string;
  /** "eligibility" uses check/warning; "duration" uses clock/warning icons. Each icon explains itself on hover or tap. */
  statusKind?: "eligibility" | "duration";
  okCount: number;
  /**
   * A temporal/seasonal exception is currently active — access is granted
   * right now (green), with a clock rather than a check to signal it's
   * time-limited. Distinct from cautionCount: this traveler is fine, not at
   * risk of anything.
   */
  temporaryCount?: number;
  /** Approaching a limit (amber). */
  cautionCount?: number;
  /** Close to a limit / refused (red). For duration this is the red clock. */
  dangerCount: number;
  /** Actual overstay (red warning). Duration rows only. */
  overstayCount?: number;
  /** Visa-required / untracked travelers (grey). */
  unknownCount?: number;
  /** Free movement — a national of the destination, or an EU/EEA citizen inside the bloc (green home icon). Duration rows only. */
  homeCount?: number;
  /** Muted placeholder shown when there are no counts (e.g. dates not set). */
  placeholder?: string;
  disabled?: boolean;
  onClick: () => void;
}

/** A status icon and how many travelers are in that status; hover or tap explains it. */
function Count<K extends StatusKind>({ kind, state, value, color }: { kind: K; state: StatusState<K>; value: number; color: string }) {
  return (
    <StatusTip kind={kind} state={state} count={value}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {legendEntry(kind, state).icon("0.9rem")}
        <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color }}>
          {value}
        </Typography>
      </Box>
    </StatusTip>
  );
}

/**
 * Tappable summary row attached beneath the Where / When cards on mobile.
 * Deliberately lighter than the input rows above it: shorter, muted, with the
 * status icons pushed to the right beside the caret.
 */
export function TripSummaryRow({
  label,
  statusKind = "eligibility",
  okCount,
  temporaryCount = 0,
  cautionCount = 0,
  dangerCount,
  overstayCount = 0,
  unknownCount = 0,
  homeCount = 0,
  placeholder,
  disabled,
  onClick,
}: TripSummaryRowProps) {
  const empty =
    okCount === 0 &&
    temporaryCount === 0 &&
    cautionCount === 0 &&
    dangerCount === 0 &&
    overstayCount === 0 &&
    unknownCount === 0 &&
    homeCount === 0;
  const isDuration = statusKind === "duration";
  return (
    <Box
      component="button"
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      sx={{
        width: "100%",
        border: "none",
        bgcolor: "transparent",
        borderTop: `1px solid ${tokens.border}`,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        px: "16px",
        py: "10px",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        textAlign: "left",
      }}
    >
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.6rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: tokens.textGhost,
          flex: 1,
        }}
      >
        {label}
      </Typography>

      {/* Status icons — right-aligned, beside the caret. */}
      {empty
        ? placeholder && (
            <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textGhost, fontStyle: "italic" }}>
              {placeholder}
            </Typography>
          )
        : (
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isDuration ? (
              <>
                {okCount > 0 && <Count kind="duration" state="safe" value={okCount} color={tokens.green} />}
                {cautionCount > 0 && <Count kind="duration" state="caution" value={cautionCount} color={tokens.amberText} />}
                {dangerCount > 0 && <Count kind="duration" state="danger" value={dangerCount} color={tokens.red} />}
                {overstayCount > 0 && <Count kind="duration" state="overstay" value={overstayCount} color={tokens.red} />}
                {unknownCount > 0 && <Count kind="duration" state="untracked" value={unknownCount} color={tokens.textGhost} />}
                {homeCount > 0 && <Count kind="duration" state="home" value={homeCount} color={tokens.green} />}
              </>
            ) : (
              <>
                {okCount > 0 && <Count kind="eligibility" state="ok" value={okCount} color={tokens.green} />}
                {temporaryCount > 0 && <Count kind="eligibility" state="temporary" value={temporaryCount} color={tokens.green} />}
                {dangerCount > 0 && <Count kind="eligibility" state="visa" value={dangerCount} color={tokens.red} />}
                {unknownCount > 0 && <Count kind="eligibility" state="unknown" value={unknownCount} color={tokens.textGhost} />}
              </>
            )}
          </Box>
        )}

      <ChevronRightIcon sx={{ fontSize: "1.1rem", color: tokens.textGhost, flexShrink: 0 }} />
    </Box>
  );
}
