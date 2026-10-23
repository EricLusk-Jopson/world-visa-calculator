import Box from "@mui/material/Box";
import type { VisaRegion } from "@/types";
import { tokens } from "@/styles/theme";
import { regionMarkerCode } from "@/features/calculator/utils/windowMarkers";

/**
 * The destination badge inside a timeline marker chip: the destination's code
 * on a fill of its view colour (see regionMarkerStyle.ts). Shared by the
 * desktop columns and the mobile timeline so both read the same.
 */
export function RegionMarkerTag({
  region,
  colour,
  opacity = 1,
}: {
  region: VisaRegion;
  colour: string;
  opacity?: number;
}) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: "3px",
        height: 10,
        borderRadius: "3px",
        bgcolor: colour,
        color: tokens.white,
        fontFamily: tokens.fontBody,
        fontSize: "0.44rem",
        fontWeight: 800,
        letterSpacing: "0.04em",
        lineHeight: 1,
        userSelect: "none",
        flexShrink: 0,
        opacity,
      }}
    >
      {regionMarkerCode(region)}
    </Box>
  );
}
