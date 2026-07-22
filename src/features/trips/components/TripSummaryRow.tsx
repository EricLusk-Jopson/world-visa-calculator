import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { tokens } from "@/styles/theme";

export interface TripSummaryRowProps {
  label: string;
  okCount: number;
  /** Approaching a limit (amber). */
  cautionCount?: number;
  /** Over a limit / refused (red). */
  dangerCount: number;
  /** Visa-required / untracked travelers (grey). */
  unknownCount?: number;
  /** Muted placeholder shown when there are no counts (e.g. dates not set). */
  placeholder?: string;
  disabled?: boolean;
  onClick: () => void;
}

function Count({ icon, value, color }: { icon: React.ReactNode; value: number; color: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {icon}
      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color }}>
        {value}
      </Typography>
    </Box>
  );
}

/**
 * Tappable summary row attached beneath the Where / When cards on mobile.
 * Deliberately lighter than the input rows above it: shorter, muted, with the
 * status icons pushed to the right beside the caret.
 */
export function TripSummaryRow({
  label,
  okCount,
  cautionCount = 0,
  dangerCount,
  unknownCount = 0,
  placeholder,
  disabled,
  onClick,
}: TripSummaryRowProps) {
  const empty = okCount === 0 && cautionCount === 0 && dangerCount === 0 && unknownCount === 0;
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
            {okCount > 0 && (
              <Count
                value={okCount}
                color={tokens.green}
                icon={<CheckCircleOutlineIcon sx={{ fontSize: "0.9rem", color: tokens.green }} />}
              />
            )}
            {cautionCount > 0 && (
              <Count
                value={cautionCount}
                color={tokens.amberText}
                icon={<WarningAmberIcon sx={{ fontSize: "0.9rem", color: tokens.amber }} />}
              />
            )}
            {dangerCount > 0 && (
              <Count
                value={dangerCount}
                color={tokens.red}
                icon={<WarningAmberIcon sx={{ fontSize: "0.9rem", color: tokens.red }} />}
              />
            )}
            {unknownCount > 0 && (
              <Count
                value={unknownCount}
                color={tokens.textGhost}
                icon={<HelpOutlineIcon sx={{ fontSize: "0.9rem", color: tokens.textGhost }} />}
              />
            )}
          </Box>
        )}

      <ChevronRightIcon sx={{ fontSize: "1.1rem", color: tokens.textGhost, flexShrink: 0 }} />
    </Box>
  );
}
