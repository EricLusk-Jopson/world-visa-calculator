import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import type { Traveler } from "@/types";
import { tokens } from "@/styles/theme";
import { TripFormCard } from "./TripFormCard";

interface Props {
  travelers: Traveler[];
  travelerIds: string[];
  onToggle: (id: string) => void;
  onAddNewTraveler: () => void;
  onReset: () => void;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

const SUMMARY_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.95rem",
  textAlign: "right" as const,
};

export function TripFormCardTravelers({
  travelers,
  travelerIds,
  onToggle,
  onAddNewTraveler,
  onReset,
  expanded,
  onExpand,
  onCollapse,
}: Props) {
  const filled = travelerIds.length > 0;
  const names = travelers
    .filter((t) => travelerIds.includes(t.id))
    .map((t) => t.name)
    .join(", ");

  const summary = (
    <Typography sx={{ ...SUMMARY_SX, color: filled ? tokens.text : tokens.textGhost, fontWeight: filled ? 500 : 400 }}>
      {filled ? names : "Select travelers"}
    </Typography>
  );

  return (
    <TripFormCard
      label="Travelers"
      summary={summary}
      expanded={expanded}
      onExpand={onExpand}
      onDone={onCollapse}
      onReset={onReset}
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {travelers.map((t) => {
          const selected = travelerIds.includes(t.id);
          return (
            <Box
              key={t.id}
              component="button"
              onClick={() => onToggle(t.id)}
              sx={{
                px: "14px",
                py: "7px",
                border: `1.5px solid ${selected ? tokens.navy : tokens.border}`,
                borderRadius: "100px",
                bgcolor: selected ? tokens.navy : "transparent",
                color: selected ? tokens.white : tokens.textSoft,
                fontFamily: tokens.fontBody,
                fontSize: "0.9rem",
                fontWeight: selected ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
                "&:active": { opacity: 0.75 },
              }}
            >
              {t.name}
            </Box>
          );
        })}
      </Box>

      <Box
        component="button"
        onClick={onAddNewTraveler}
        sx={{
          mt: "12px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          px: "14px",
          py: "10px",
          border: `1.5px dashed ${tokens.border}`,
          borderRadius: "10px",
          bgcolor: "transparent",
          color: tokens.textSoft,
          fontFamily: tokens.fontBody,
          fontSize: "0.88rem",
          fontWeight: 500,
          cursor: "pointer",
          "&:active": { bgcolor: tokens.mist },
        }}
      >
        <AddIcon sx={{ fontSize: "1rem" }} />
        Add new traveler
      </Box>
    </TripFormCard>
  );
}
