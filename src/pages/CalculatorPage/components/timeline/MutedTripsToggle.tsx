import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { tokens } from "@/styles/theme";

/** Floating pill that switches the timeline between trips and markers focus. */
export function MutedTripsToggle({
  muted,
  onToggle,
}: {
  muted: boolean;
  onToggle: () => void;
}) {
  return (
    <ButtonBase
      onClick={onToggle}
      aria-pressed={muted}
      title={
        muted
          ? "Show trip details on the cards again"
          : "Fade trip cards to plain tiles so the markers are easy to read"
      }
      sx={{
        position: "absolute",
        left: 16,
        bottom: 16,
        zIndex: 20,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        px: "12px",
        height: 34,
        borderRadius: "100px",
        bgcolor: muted ? tokens.navy : tokens.white,
        color: muted ? tokens.white : tokens.navy,
        border: `1px solid ${muted ? tokens.navy : tokens.border}`,
        boxShadow: `0 2px 8px ${alpha(tokens.navy, 0.12)}`,
      }}
    >
      <LayersOutlinedIcon sx={{ fontSize: "1rem" }} />
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.75rem",
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {muted ? "Show trip details" : "Focus on markers"}
      </Typography>
    </ButtonBase>
  );
}
