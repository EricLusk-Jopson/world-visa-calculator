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
  { region: VisaRegion.Ireland, label: "Ireland" },
  { region: VisaRegion.UnitedKingdom, label: "United Kingdom" },
];

function activeStyles(region: VisaRegion) {
  switch (region) {
    case VisaRegion.Schengen:
      return { borderColor: tokens.green, bgcolor: tokens.greenBg, color: tokens.greenText };
    case VisaRegion.Elsewhere:
      return { borderColor: tokens.border, bgcolor: tokens.navy, color: "#fff" };
    case VisaRegion.Ireland:
      return { borderColor: tokens.amber, bgcolor: tokens.amberBg, color: tokens.amberText };
    case VisaRegion.UnitedKingdom:
      return { borderColor: tokens.red, bgcolor: tokens.redBg, color: tokens.redText };
  }
}

interface RegionSelectorProps {
  value: VisaRegion;
  onChange: (region: VisaRegion) => void;
  /** Optional sx override on the outer container */
  sx?: object;
}

/**
 * Segmented control for selecting a visa region.
 * Renders in a 2×2 grid. Active state colour varies per region.
 */
export function RegionSelector({
  value,
  onChange,
  sx = {},
}: RegionSelectorProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "6px",
        ...sx,
      }}
    >
      {OPTIONS.map(({ region, label }) => {
        const isActive = value === region;

        return (
          <Box
            key={region}
            component="button"
            onClick={() => onChange(region)}
            sx={{
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
              ...(isActive && activeStyles(region)),
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
