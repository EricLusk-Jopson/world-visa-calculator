/**
 * MobileAwareTooltip
 *
 * Drop-in replacement for MUI Tooltip that handles touch devices properly:
 *   - Desktop (hover capable): identical to MUI Tooltip (hover to open/close)
 *   - Mobile / touch-only: opens on tap, closes via ClickAwayListener or the
 *     × button rendered inside the tooltip content.
 *
 * Usage: swap `<Tooltip …>` for `<MobileAwareTooltip …>` — all existing props
 * (placement, arrow, componentsProps, etc.) are forwarded unchanged.
 */

import { useState } from "react";
import Tooltip, { type TooltipProps } from "@mui/material/Tooltip";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";

export function MobileAwareTooltip({
  title,
  children,
  ...rest
}: TooltipProps) {
  // `(hover: none)` is true on touch-only devices (phones, tablets) where the
  // primary pointing device cannot hover. False on desktop/laptop.
  const isTouchDevice = useMediaQuery("(hover: none)");
  const [open, setOpen] = useState(false);

  // ── Desktop path ─────────────────────────────────────────────────────────────
  if (!isTouchDevice) {
    return (
      <Tooltip title={title} {...rest}>
        {children}
      </Tooltip>
    );
  }

  // ── Mobile path ──────────────────────────────────────────────────────────────
  if (!title) return <>{children}</>;

  // Augment the tooltip title with a close button. The button is rendered inside
  // the tooltip popup so tapping it closes the tooltip explicitly. Tapping
  // anywhere outside the ClickAwayListener bounds (including the popup, which
  // is rendered in a portal) also closes via onClickAway.
  const mobileTitle = (
    <Box
      component="span"
      sx={{ display: "flex", alignItems: "flex-start", gap: "8px" }}
    >
      <Box component="span" sx={{ flex: 1 }}>
        {title}
      </Box>
      <CloseIcon
        onClick={(e) => {
          e.stopPropagation();
          setOpen(false);
        }}
        sx={{
          fontSize: "0.82rem",
          cursor: "pointer",
          flexShrink: 0,
          mt: "1px",
          opacity: 0.6,
          "&:active": { opacity: 1 },
        }}
      />
    </Box>
  );

  return (
    // The ClickAwayListener's bound element is the outer <span>. Any tap
    // outside this element (including taps on the portal-rendered tooltip
    // popup) fires onClickAway and closes the tooltip.
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <span style={{ display: "inline-flex", pointerEvents: "auto" }}>
        <Tooltip
          title={mobileTitle}
          open={open}
          // Disable all automatic triggers — we manage open state ourselves.
          disableHoverListener
          disableFocusListener
          disableTouchListener
          {...rest}
        >
          {/* Wrap children so we can intercept taps. Toggle on repeated tap. */}
          <span
            style={{ display: "inline-flex", pointerEvents: "auto" }}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            {children}
          </span>
        </Tooltip>
      </span>
    </ClickAwayListener>
  );
}
