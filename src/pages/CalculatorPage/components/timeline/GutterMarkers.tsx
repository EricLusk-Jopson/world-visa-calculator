/**
 * Rolling-window markers as drawn in the marker gutter — shared by the
 * desktop columns and the mobile timeline so both read the same.
 *
 * A marker has two parts:
 *   - a guide line across the trip area at the marker's exact date (dashed
 *     for "a trip of N days is possible from here", dotted for "a past trip
 *     starts ageing out"), drawn behind the cards — or over them while trip
 *     cards are muted;
 *   - a chip in the gutter, which never sits under a card. Chips on nearby
 *     dates stack downward (stackGutterItems), so the chip can sit a little
 *     below its line; its tooltip gives the exact date.
 *
 * The only colour a chip carries is green/amber for how long a stay is
 * possible. The destination is named in plain text ("Türkiye 90d").
 */

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { ReactNode } from "react";
import { tokens } from "@/styles/theme";
import { MobileAwareTooltip } from "@/components/ui/MobileAwareTooltip";
import {
  RETURN_CHIP_HEIGHT,
  AGING_CHIP_HEIGHT,
  AGING_CHIP_FIRST_ROW,
  returnMarkerColors,
} from "./gutterMarkerStyle";

const TOOLTIP_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.72rem",
  fontWeight: 500,
  bgcolor: tokens.navy,
  "& .MuiTooltip-arrow": { color: tokens.navy },
  maxWidth: 260,
};

// ─── Guide line ───────────────────────────────────────────────────────────────

export function MarkerGuideLine({
  top,
  left,
  kind,
  color,
  opacity,
  zIndex,
}: {
  top: number;
  left: number;
  kind: "return" | "aging";
  color: string;
  opacity: number;
  zIndex: number;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        left,
        right: 8,
        top,
        height: 0,
        borderTop: `1px ${kind === "return" ? "dashed" : "dotted"} ${alpha(color, opacity)}`,
        pointerEvents: "none",
        zIndex,
      }}
    />
  );
}

// ─── Gutter chips ─────────────────────────────────────────────────────────────

function GutterTooltip({
  title,
  children,
}: {
  title: ReactNode;
  children: React.ReactElement;
}) {
  return (
    <MobileAwareTooltip
      title={title}
      placement="right"
      arrow
      enterDelay={200}
      componentsProps={{ tooltip: { sx: TOOLTIP_SX } }}
    >
      {children}
    </MobileAwareTooltip>
  );
}

/** "Türkiye 90d" — a stay of `days` is possible from this date. */
export function ReturnGutterChip({
  top,
  left,
  width,
  regionName,
  days,
  allowance,
  tooltip,
  leading,
}: {
  top: number;
  left: number;
  width: number;
  regionName: string;
  days: number;
  allowance: number;
  tooltip: ReactNode;
  /** Shown before the name, e.g. traveller dots on mobile. */
  leading?: ReactNode;
}) {
  const { lineBase, textColor, bgColor, pillOpacity } = returnMarkerColors(
    days,
    allowance,
  );
  return (
    <Box
      // flex, not block: an inline-flex chip in a block box would sit on a
      // line box and render below `top`, breaking the gutter stacking.
      sx={{ position: "absolute", top, left, maxWidth: width, zIndex: 3, display: "flex" }}
    >
      <GutterTooltip title={tooltip}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            maxWidth: width,
            height: RETURN_CHIP_HEIGHT,
            boxSizing: "border-box",
            px: "6px",
            borderRadius: "100px",
            bgcolor: bgColor,
            border: `1px dashed ${alpha(lineBase, 0.35)}`,
            cursor: "default",
          }}
        >
          {leading}
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.56rem",
              fontWeight: 600,
              color: alpha(textColor, pillOpacity * 0.85),
              lineHeight: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
              userSelect: "none",
            }}
          >
            {regionName}
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.58rem",
              fontWeight: 800,
              color: alpha(textColor, pillOpacity),
              lineHeight: 1,
              flexShrink: 0,
              userSelect: "none",
            }}
          >
            {days}d
          </Typography>
          {/* The info icon gives way to traveller dots: the gutter can't
              fit both and a full destination name. */}
          {!leading && (
            <InfoOutlinedIcon
              sx={{
                fontSize: "0.6rem",
                color: alpha(textColor, pillOpacity * 0.6),
                flexShrink: 0,
              }}
            />
          )}
        </Box>
      </GutterTooltip>
    </Box>
  );
}

/**
 * Two rows: "+52d ages out" over the trip's name (or "3 trips"). `tripDays`
 * is null for a grouped marker, which shows only "ages out".
 */
export function AgingGutterChip({
  top,
  left,
  width,
  title,
  tripDays,
  tooltip,
}: {
  top: number;
  left: number;
  width: number;
  title: string;
  tripDays: number | null;
  tooltip: ReactNode;
}) {
  return (
    <Box
      sx={{ position: "absolute", top, left, width, zIndex: 3 }}
    >
      <GutterTooltip title={tooltip}>
        <Box sx={{ display: "flex", flexDirection: "column", cursor: "default" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              height: AGING_CHIP_FIRST_ROW,
            }}
          >
            {tripDays !== null && (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  px: "5px",
                  height: AGING_CHIP_FIRST_ROW,
                  boxSizing: "border-box",
                  borderRadius: "100px",
                  bgcolor: tokens.mist,
                  border: `1px dotted ${alpha(tokens.textGhost, 0.5)}`,
                  fontFamily: tokens.fontBody,
                  fontSize: "0.56rem",
                  fontWeight: 800,
                  color: tokens.textSoft,
                  lineHeight: 1,
                  flexShrink: 0,
                  userSelect: "none",
                }}
              >
                +{tripDays}d
              </Box>
            )}
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.5rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: tokens.textGhost,
                lineHeight: 1,
                whiteSpace: "nowrap",
                userSelect: "none",
              }}
            >
              ages out
            </Typography>
            <InfoOutlinedIcon
              sx={{
                fontSize: "0.58rem",
                color: alpha(tokens.textGhost, 0.8),
                flexShrink: 0,
              }}
            />
          </Box>
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.6rem",
              fontWeight: 600,
              color: tokens.textSoft,
              lineHeight: `${AGING_CHIP_HEIGHT - AGING_CHIP_FIRST_ROW}px`,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              userSelect: "none",
            }}
          >
            {title}
          </Typography>
        </Box>
      </GutterTooltip>
    </Box>
  );
}
