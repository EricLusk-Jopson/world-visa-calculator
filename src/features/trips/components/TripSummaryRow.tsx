import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { tokens } from "@/styles/theme";

export interface TripSummaryRowProps {
  label: string;
  okCount: number;
  warnCount: number;
  /** Muted placeholder shown when there are no counts (e.g. dates not set). */
  placeholder?: string;
  disabled?: boolean;
  onClick: () => void;
}

/**
 * Tappable summary row attached beneath the Where / When cards on mobile.
 * Shows an icon + count per status and opens a full-screen detail frame.
 */
export function TripSummaryRow({
  label,
  okCount,
  warnCount,
  placeholder,
  disabled,
  onClick,
}: TripSummaryRowProps) {
  const empty = okCount === 0 && warnCount === 0;
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
        gap: "10px",
        px: "16px",
        py: "13px",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        textAlign: "left",
      }}
    >
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.65rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.09em",
          color: tokens.textSoft,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
        {empty ? (
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.78rem",
              color: tokens.textGhost,
              fontStyle: "italic",
            }}
          >
            {placeholder ?? ""}
          </Typography>
        ) : (
          <>
            {okCount > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <CheckCircleOutlineIcon sx={{ fontSize: "1rem", color: tokens.green }} />
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.8rem", fontWeight: 600, color: tokens.green }}>
                  {okCount}
                </Typography>
              </Box>
            )}
            {warnCount > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <WarningAmberIcon sx={{ fontSize: "1rem", color: tokens.red }} />
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.8rem", fontWeight: 600, color: tokens.red }}>
                  {warnCount}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>

      <ChevronRightIcon sx={{ fontSize: "1.3rem", color: tokens.textGhost, flexShrink: 0 }} />
    </Box>
  );
}
