import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "@/styles/theme";

export interface TripFormCardProps {
  label: string;
  summary: React.ReactNode;
  expanded: boolean;
  onExpand: () => void;
  children: React.ReactNode;
  onDone?: () => void;
  onReset?: () => void;
}

const LABEL_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.65rem",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.09em",
  flexShrink: 0,
};

const HEADER_BTN_SX = {
  border: "none",
  bgcolor: "transparent",
  fontFamily: tokens.fontBody,
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer",
  px: "4px",
  py: "2px",
};

export function TripFormCard({
  label,
  summary,
  expanded,
  onExpand,
  children,
  onDone,
  onReset,
}: TripFormCardProps) {
  return (
    <Box
      sx={{
        borderRadius: "14px",
        border: `1.5px solid ${expanded ? tokens.navy : tokens.border}`,
        bgcolor: tokens.white,
        overflow: "hidden",
        transition: "border-color 0.15s",
        cursor: expanded ? "default" : "pointer",
      }}
      onClick={!expanded ? onExpand : undefined}
    >
      {expanded ? (
        <Box sx={{ px: "16px", pt: "14px", pb: "14px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: "10px",
            }}
          >
            <Typography sx={{ ...LABEL_SX, color: tokens.navy }}>{label}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
              {onReset && (
                <Box
                  component="button"
                  onClick={onReset}
                  sx={{ ...HEADER_BTN_SX, color: tokens.textSoft }}
                >
                  Reset
                </Box>
              )}
              {onDone && (
                <Box
                  component="button"
                  onClick={onDone}
                  sx={{ ...HEADER_BTN_SX, color: tokens.navy }}
                >
                  Done
                </Box>
              )}
            </Box>
          </Box>
          {children}
        </Box>
      ) : (
        <Box
          sx={{
            px: "16px",
            py: "14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Typography sx={{ ...LABEL_SX, color: tokens.textSoft }}>{label}</Typography>
          <Box sx={{ flex: 1, textAlign: "right" }}>{summary}</Box>
          <ExpandMoreIcon
            sx={{ color: tokens.textGhost, fontSize: "1.2rem", flexShrink: 0 }}
          />
        </Box>
      )}
    </Box>
  );
}
