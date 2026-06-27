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
  headerRight?: React.ReactNode;
}

const LABEL_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.65rem",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.09em",
  flexShrink: 0,
};

export function TripFormCard({
  label,
  summary,
  expanded,
  onExpand,
  children,
  headerRight,
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
            {headerRight}
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
