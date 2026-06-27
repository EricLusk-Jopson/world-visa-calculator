import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { tokens } from "@/styles/theme";
import { TripFormCard } from "./TripFormCard";

interface Props {
  name: string;
  onChange: (v: string) => void;
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

export function TripFormCardName({ name, onChange, onReset, expanded, onExpand, onCollapse }: Props) {
  const filled = name.trim().length > 0;

  const summary = (
    <Typography sx={{ ...SUMMARY_SX, color: filled ? tokens.text : tokens.textGhost, fontWeight: filled ? 500 : 400 }}>
      {filled ? name : "Untitled trip"}
    </Typography>
  );

  return (
    <TripFormCard
      label="Trip name"
      summary={summary}
      expanded={expanded}
      onExpand={onExpand}
      onDone={onCollapse}
      onReset={onReset}
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
