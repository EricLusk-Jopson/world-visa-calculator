import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { tokens } from "@/styles/theme";
import { COUNTRIES } from "@/data/countries";

// ─── Component ────────────────────────────────────────────────────────────────

interface NationalitySelectorProps {
  value: string | null;
  onChange: (code: string | null) => void;
  label?: string;
  autoFocus?: boolean;
}

export function NationalitySelector({
  value,
  onChange,
  label = "Passport / nationality",
  autoFocus = false,
}: NationalitySelectorProps) {
  const selected = COUNTRIES.find((c) => c.code === value) ?? null;

  return (
    <Autocomplete
      options={COUNTRIES}
      value={selected}
      onChange={(_event, newValue) => onChange(newValue?.code ?? null)}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, val) => option.code === val.code}
      autoHighlight
      clearOnEscape
      renderInput={(params) => (
        <TextField
          {...params}
          label={undefined}
          placeholder={label}
          autoFocus={autoFocus}
          sx={{
            "& .MuiOutlinedInput-root": {
              fontFamily: tokens.fontBody,
              fontSize: "0.85rem",
              bgcolor: tokens.mist,
              borderRadius: "10px",
              "& fieldset": {
                borderColor: tokens.border,
                borderWidth: 1.5,
              },
              "&:hover fieldset": { borderColor: tokens.navy },
              "&.Mui-focused fieldset": {
                borderColor: tokens.navy,
                borderWidth: 1.5,
                boxShadow: `0 0 0 3px rgba(12,30,60,0.06)`,
              },
            },
            "& .MuiOutlinedInput-input": {
              py: "9px",
              px: "11px",
              color: tokens.text,
              "&::placeholder": { color: tokens.textGhost, opacity: 1 },
            },
          }}
        />
      )}
    />
  );
}
