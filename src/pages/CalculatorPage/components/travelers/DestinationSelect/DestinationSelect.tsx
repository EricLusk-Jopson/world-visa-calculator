import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { VISA_REGION_LABELS, type Traveler, type VisaRegion } from "@/types";
import { tokens } from "@/styles/theme";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  rankDestinationCandidates,
  computeDestinationStatus,
} from "@/features/calculator/utils/destinationStatus";

interface DestinationSelectProps {
  traveler: Traveler;
  value: VisaRegion;
  onChange: (region: VisaRegion) => void;
  refDate?: Date;
}

/**
 * Lists every destination in the traveler's 1-year trip-history lookback
 * window, one row per region: name on the left, allowance chips (or a
 * "Visa required" note when the passport isn't eligible) on the right.
 * Visa-required rows are disabled — there's nothing calculable to preview.
 *
 * Renders nothing when the traveler has no trips in the lookback window —
 * callers should show their own empty-state copy in that case.
 */
export function DestinationSelect({
  traveler,
  value,
  onChange,
  refDate,
}: DestinationSelectProps) {
  const candidates = rankDestinationCandidates(traveler, refDate);
  if (candidates.length === 0) return null;

  const handleChange = (e: SelectChangeEvent<number>) => {
    onChange(Number(e.target.value) as VisaRegion);
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      fullWidth
      renderValue={(selected) => VISA_REGION_LABELS[selected as VisaRegion]}
      MenuProps={{
        PaperProps: {
          sx: {
            borderRadius: "10px",
            border: `1px solid ${tokens.border}`,
            boxShadow: "0 4px 20px rgba(12,30,60,0.14)",
          },
        },
      }}
      sx={{
        fontFamily: tokens.fontBody,
        fontSize: "0.85rem",
        bgcolor: tokens.mist,
        borderRadius: "10px",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: tokens.border,
          borderWidth: 1.5,
        },
        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: tokens.navy },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: tokens.navy,
          borderWidth: 1.5,
        },
        "& .MuiSelect-select": { py: "9px", px: "11px", color: tokens.text },
      }}
    >
      {candidates.map(({ region }) => {
        const status = computeDestinationStatus(traveler, region, refDate);
        return (
          <MenuItem
            key={region}
            value={region}
            disabled={!status.eligible}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              py: "9px",
              px: "12px",
              fontFamily: tokens.fontBody,
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.85rem",
                fontWeight: 500,
                color: status.eligible ? tokens.text : tokens.textGhost,
              }}
            >
              {VISA_REGION_LABELS[region]}
            </Typography>

            {status.eligible ? (
              <Box sx={{ display: "flex", gap: "5px", flexShrink: 0 }}>
                {status.availableChip && (
                  <StatusBadge
                    variant={status.availableChip.variant}
                    label={status.availableChip.label}
                  />
                )}
                {status.secondChip && (
                  <StatusBadge
                    variant={status.secondChip.variant}
                    label={status.secondChip.label}
                  />
                )}
              </Box>
            ) : (
              <Typography
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.68rem",
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
          </MenuItem>
        );
      })}
    </Select>
  );
}
