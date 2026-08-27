import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { VISA_REGION_LABELS, type Traveler, type VisaRegion } from "@/types";
import { tokens } from "@/styles/theme";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  categorizeAllDestinations,
  computeDestinationStatus,
  DESTINATION_CATEGORY_LABELS,
  type CategorizedDestination,
} from "@/features/calculator/utils/destinationStatus";

interface DestinationSelectProps {
  traveler: Traveler;
  value: VisaRegion;
  onChange: (region: VisaRegion) => void;
  refDate?: Date;
}

const INPUT_SX = {
  "& .MuiOutlinedInput-root": {
    fontFamily: tokens.fontBody,
    fontSize: "0.85rem",
    bgcolor: tokens.mist,
    borderRadius: "10px",
    "& fieldset": { borderColor: tokens.border, borderWidth: 1.5 },
    "&:hover fieldset": { borderColor: tokens.navy },
    "&.Mui-focused fieldset": {
      borderColor: tokens.navy,
      borderWidth: 1.5,
      boxShadow: "0 0 0 3px rgba(12,30,60,0.06)",
    },
  },
  "& .MuiOutlinedInput-input": { py: "9px", px: "11px", color: tokens.text },
} as const;

/**
 * Searchable, grouped dropdown listing every region the app tracks — not
 * just the ones with recent trip history. Options are grouped and ordered by
 * temporal relevance (current trip, recently visited, upcoming, old trip,
 * never visited — see categorizeAllDestinations), one row per region: name
 * on the left, compact allowance chips (or a "Visa required" note when the
 * passport isn't eligible) on the right. Visa-required rows are disabled —
 * there's nothing calculable to preview.
 */
export function DestinationSelect({
  traveler,
  value,
  onChange,
  refDate,
}: DestinationSelectProps) {
  const options = categorizeAllDestinations(traveler, refDate);
  const selected = options.find((o) => o.region === value) ?? options[0];

  return (
    <Autocomplete<CategorizedDestination, false, true>
      options={options}
      value={selected}
      disableClearable
      autoHighlight
      blurOnSelect
      groupBy={(option) => DESTINATION_CATEGORY_LABELS[option.category]}
      getOptionLabel={(option) => VISA_REGION_LABELS[option.region]}
      isOptionEqualToValue={(option, val) => option.region === val.region}
      onChange={(_event, newValue) => {
        if (newValue) onChange(newValue.region);
      }}
      getOptionDisabled={(option) =>
        !computeDestinationStatus(traveler, option.region, refDate).eligible
      }
      renderGroup={(params) => (
        <Box key={params.key}>
          <Divider sx={{ mx: "10px", my: "3px" }} />
          <Typography
            sx={{
              px: "14px",
              pt: "5px",
              pb: "2px",
              fontFamily: tokens.fontBody,
              fontSize: "0.62rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.09em",
              color: tokens.textGhost,
            }}
          >
            {params.group}
          </Typography>
          {params.children}
        </Box>
      )}
      renderOption={(props, option) => {
        const { key, ...liProps } = props as {
          key: React.Key;
        } & React.HTMLAttributes<HTMLLIElement>;
        const status = computeDestinationStatus(traveler, option.region, refDate);

        return (
          <Box
            component="li"
            key={key}
            {...liProps}
            sx={{
              fontFamily: tokens.fontBody,
              display: "flex !important",
              alignItems: "center !important",
              justifyContent: "space-between !important",
              gap: "10px",
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.85rem",
                fontWeight: 500,
                color: status.eligible ? tokens.text : tokens.textGhost,
                flex: 1,
                minWidth: 0,
              }}
            >
              {VISA_REGION_LABELS[option.region]}
            </Typography>

            {status.eligible ? (
              <Box sx={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                {status.availableChip && (
                  <StatusBadge
                    variant={status.availableChip.variant}
                    label={status.availableChip.label}
                    dot={false}
                    sx={{ fontSize: "0.6rem", "& .MuiChip-label": { px: "6px", py: "1px" } }}
                  />
                )}
                {status.secondChip && (
                  <StatusBadge
                    variant={status.secondChip.variant}
                    label={status.secondChip.label}
                    dot={false}
                    sx={{ fontSize: "0.6rem", "& .MuiChip-label": { px: "6px", py: "1px" } }}
                  />
                )}
              </Box>
            ) : (
              <Typography
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.66rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: tokens.textGhost,
                  flexShrink: 0,
                }}
              >
                Visa required
              </Typography>
            )}
          </Box>
        );
      }}
      slotProps={{
        paper: {
          sx: {
            mt: "4px",
            borderRadius: "10px",
            border: `1px solid ${tokens.border}`,
            boxShadow: "0 4px 20px rgba(12,30,60,0.14)",
            "& .MuiAutocomplete-option": {
              px: "12px !important",
              py: "7px !important",
              minHeight: "unset !important",
            },
          },
        },
      }}
      renderInput={(params) => (
        <TextField {...params} placeholder="Search destinations…" sx={INPUT_SX} />
      )}
    />
  );
}
