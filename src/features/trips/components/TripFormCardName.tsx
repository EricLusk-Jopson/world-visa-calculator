import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { tokens } from "@/styles/theme";
import { TripFormCard } from "./TripFormCard";

interface Props {
  name: string;
  onChange: (v: string) => void;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

const SUMMARY_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.95rem",
  textAlign: "right" as const,
};

export function TripFormCardName({ name, onChange, expanded, onExpand, onCollapse }: Props) {
  const filled = name.trim().length > 0;

  const summary = (
    <Typography sx={{ ...SUMMARY_SX, color: filled ? tokens.text : tokens.textGhost, fontWeight: filled ? 500 : 400 }}>
      {filled ? name : "Untitled trip"}
    </Typography>
  );

  const doneButton = (
    <Box
      component="button"
      onClick={onCollapse}
      sx={{
        border: "none",
        bgcolor: "transparent",
        fontFamily: tokens.fontBody,
        fontSize: "0.8rem",
        fontWeight: 600,
        color: tokens.navy,
        cursor: "pointer",
        px: "4px",
        py: "2px",
      }}
    >
      Done
    </Box>
  );

  return (
    <TripFormCard
      label="Trip name"
      summary={summary}
      expanded={expanded}
      onExpand={onExpand}
      headerRight={doneButton}
    >
      <TextField
        value={name}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Paris & Barcelona"
        fullWidth
        autoFocus
        inputProps={{ maxLength: 60 }}
        variant="standard"
        sx={{
          "& .MuiInputBase-input": {
            fontFamily: tokens.fontBody,
            fontSize: "1rem",
            color: tokens.text,
            "&::placeholder": { color: tokens.textGhost, opacity: 1 },
          },
          "& .MuiInput-underline:before": { borderBottomColor: tokens.border },
          "& .MuiInput-underline:after": { borderBottomColor: tokens.navy },
        }}
      />
    </TripFormCard>
  );
}
