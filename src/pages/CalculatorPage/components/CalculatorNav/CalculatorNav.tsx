import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { alpha, useMediaQuery } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import IosShareIcon from "@mui/icons-material/IosShare";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { tokens } from "@/styles/theme";
import { NavButton } from "./NavButton";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CalcView = "timeline" | "cards";

interface CalculatorNavProps {
  view: CalcView;
  onViewChange: (v: CalcView) => void;
  onAddTraveler: () => void;
  onAddTrip: () => void;
  travelerCount: number;
  onShare: () => void;
  onClearAll: () => void;
}

// ─── Shared icon size ─────────────────────────────────────────────────────────

const ICON_SX = { fontSize: "0.95rem" } as const;

// ─── Styles ───────────────────────────────────────────────────────────────────

const NAV_SX = {
  height: 54,
  bgcolor: tokens.navy,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  px: "20px",
  flexShrink: 0,
  zIndex: 10,
  position: "relative",
  boxShadow: `0 2px 12px ${alpha(tokens.navy, 0.18)}`,
} as const;

const LOGO_DOT_SX = {
  width: 7,
  height: 7,
  bgcolor: tokens.green,
  borderRadius: "50%",
  flexShrink: 0,
} as const;

const LOGO_TEXT_SX = {
  fontFamily: tokens.fontDisplay,
  fontSize: "0.95rem",
  fontWeight: 600,
  color: tokens.white,
  letterSpacing: "-0.01em",
} as const;

const VIEW_TOGGLE_WRAPPER_SX = {
  display: "flex",
  bgcolor: alpha(tokens.white, 0.08),
  borderRadius: "7px",
  p: "3px",
  gap: "2px",
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
} as const;

const viewToggleButtonSx = (active: boolean) =>
  ({
    px: "14px",
    py: "5px",
    border: "none",
    borderRadius: "5px",
    fontFamily: tokens.fontBody,
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.02em",
    cursor: "pointer",
    transition: "all 0.15s",
    textTransform: "capitalize",
    bgcolor: active ? alpha(tokens.white, 0.14) : "transparent",
    color: active ? tokens.white : alpha(tokens.white, 0.4),
    "&:hover": {
      bgcolor: active ? alpha(tokens.white, 0.14) : alpha(tokens.white, 0.07),
      color: tokens.white,
    },
  }) as const;

const MENU_ITEM_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.83rem",
  fontWeight: 500,
  color: alpha(tokens.white, 0.8),
  gap: "8px",
  py: "9px",
  px: "14px",
  "&:hover": { bgcolor: alpha(tokens.white, 0.07) },
  "&.Mui-disabled": { color: alpha(tokens.white, 0.25), opacity: 1 },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function CalculatorNav({
  view,
  onViewChange,
  onAddTraveler,
  onAddTrip,
  travelerCount,
  onShare,
  onClearAll,
}: CalculatorNavProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Collapse to kebab menu below 1051px to prevent action buttons
  // from overlapping the absolutely-centred view toggle.
  const isDesktop = useMediaQuery("(min-width:1051px)");

  const closeMenu = () => setMenuAnchor(null);

  const menuAction = (fn: () => void) => () => {
    fn();
    closeMenu();
  };

  return (
    <Box component="nav" sx={NAV_SX}>
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <Box sx={LOGO_DOT_SX} />
        {/* Hide text when collapsed to avoid crowding the centred toggle */}
        {isDesktop && (
          <Typography sx={LOGO_TEXT_SX}>EuroVisaCalculator</Typography>
        )}
      </Box>

      {/* ── View toggle — always centred, always visible ───────────────────── */}
      <Box sx={VIEW_TOGGLE_WRAPPER_SX}>
        {(["timeline", "cards"] as const).map((v) => (
          <Box
            key={v}
            component="button"
            onClick={() => onViewChange(v)}
            sx={viewToggleButtonSx(view === v)}
          >
            {v}
          </Box>
        ))}
      </Box>

      {/* ── Right side ────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Desktop: individual action buttons */}
        {isDesktop && (
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <NavButton
              variant="destructive"
              onClick={onClearAll}
              disabled={travelerCount === 0}
              icon={<DeleteOutlineIcon sx={ICON_SX} />}
            >
              Clear All
            </NavButton>

            <NavButton
              variant="ghost"
              onClick={onShare}
              icon={<IosShareIcon sx={ICON_SX} />}
            >
              Share
            </NavButton>

            <NavButton
              variant="ghost"
              onClick={onAddTraveler}
              icon={<AddIcon sx={ICON_SX} />}
            >
              Add Traveler
            </NavButton>

            <NavButton
              variant="cta"
              onClick={onAddTrip}
              icon={<AddIcon sx={ICON_SX} />}
              disabled={travelerCount === 0}
            >
              Add Trip
            </NavButton>
          </Box>
        )}

        {/* Mobile/narrow: kebab menu */}
        {!isDesktop && (
          <Box>
            <Box
              component="button"
              onClick={(e: React.MouseEvent<HTMLElement>) =>
                setMenuAnchor(e.currentTarget)
              }
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                bgcolor: "transparent",
                border: "none",
                borderRadius: "7px",
                color: tokens.white,
                cursor: "pointer",
                transition: "background 0.15s",
                "&:hover": {
                  bgcolor: alpha(tokens.white, 0.08),
                },
              }}
            >
              <MoreVertIcon sx={{ fontSize: "1.25rem" }} />
            </Box>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={closeMenu}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{
                paper: {
                  sx: {
                    bgcolor: tokens.navyMid,
                    border: `1px solid ${alpha(tokens.white, 0.1)}`,
                    boxShadow: `0 8px 32px ${alpha(tokens.navy, 0.5)}`,
                    borderRadius: "10px",
                    minWidth: 190,
                    mt: "6px",
                    colorScheme: "dark",
                  },
                },
              }}
            >
              <MenuItem onClick={menuAction(onAddTraveler)} sx={MENU_ITEM_SX}>
                <AddIcon sx={ICON_SX} />
                Add Traveler
              </MenuItem>

              <MenuItem
                onClick={menuAction(onAddTrip)}
                disabled={travelerCount === 0}
                sx={MENU_ITEM_SX}
              >
                <AddIcon sx={ICON_SX} />
                Add Trip
              </MenuItem>

              <MenuItem onClick={menuAction(onShare)} sx={MENU_ITEM_SX}>
                <IosShareIcon sx={ICON_SX} />
                Share
              </MenuItem>

              <Divider
                sx={{ borderColor: alpha(tokens.white, 0.08), my: "4px" }}
              />

              <MenuItem
                onClick={menuAction(onClearAll)}
                disabled={travelerCount === 0}
                sx={{
                  ...MENU_ITEM_SX,
                  color: alpha(tokens.red, 0.85),
                  "&:hover": {
                    bgcolor: alpha(tokens.red, 0.1),
                    color: tokens.red,
                  },
                  "&.Mui-disabled": {
                    color: alpha(tokens.red, 0.25),
                    opacity: 1,
                  },
                }}
              >
                <DeleteOutlineIcon sx={ICON_SX} />
                Clear All
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Box>
    </Box>
  );
}
