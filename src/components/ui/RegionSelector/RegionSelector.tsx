import Box from "@mui/material/Box";
import { tokens } from "@/styles/theme";
import { VisaRegion } from "@/types";

interface RegionOption {
  region: VisaRegion;
  label: string;
}

const OPTIONS: RegionOption[] = [
  { region: VisaRegion.Schengen, label: "Schengen Zone" },
  { region: VisaRegion.Elsewhere, label: "Elsewhere" },
];

interface RegionSelectorProps {
  value: VisaRegion;
  onChange: (region: VisaRegion) => void;
  /** Optional sx override on the outer container */
  sx?: object;
}

/**
 * Two-button segmented control for selecting a visa region.
 * Active state differs per region: Schengen = green tint, Elsewhere = navy fill.
 */
export function RegionSelector({
  value,
  onChange,
  sx = {},
}: RegionSelectorProps) {
  return (
    <Box sx={{ display: "flex", gap: "6px", ...sx }}>
      {OPTIONS.map(({ region, label }) => {
        const isActive = value === region;
        const activeSchengen = isActive && region === VisaRegion.Schengen;
        const activeElsewhere = isActive && region === VisaRegion.Elsewhere;

        return (
          <Box
            key={region}
            component="button"
            onClick={() => onChange(region)}
            sx={{
              flex: 1,
              py: "8px",
              px: "6px",
              textAlign: "center",
              border: "1.5px solid",
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: tokens.fontBody,
              fontSize: "0.75rem",
              fontWeight: 600,
              transition: "all 0.14s",
              userSelect: "none",
              // Default (inactive)
              borderColor: tokens.border,
              bgcolor: tokens.mist,
              color: tokens.textSoft,
              // Active overrides
              ...(activeSchengen && {
                borderColor: tokens.green,
                bgcolor: tokens.greenBg,
                color: tokens.greenText,
              }),
              ...(activeElsewhere && {
                borderColor: tokens.border,
                bgcolor: tokens.navy,
                color: "#fff",
              }),
              "&:hover:not(:disabled)": {
                borderColor: isActive ? undefined : tokens.navy,
                color: isActive ? undefined : tokens.navy,
              },
            }}
          >
            {label}
          </Box>
        );
      })}
    </Box>
  );
}
