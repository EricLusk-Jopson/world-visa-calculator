import { useState } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
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

const MENU_PAPER_SX = {
  bgcolor: tokens.navyMid,
  border: `1px solid ${alpha(tokens.white, 0.1)}`,
  boxShadow: `0 8px 32px ${alpha(tokens.navy, 0.5)}`,
  borderRadius: "10px",
  minWidth: 190,
  mt: "6px",
  colorScheme: "dark",
} as const;

// ─── Ko-fi link (shared between tiers) ────────────────────────────────────────

function KofiLink() {
  return (
    <Link
      href="https://ko-fi.com/ericluskjopson"
      target="_blank"
      rel="noopener noreferrer"
      underline="none"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        px: "14px",
        py: "6px",
        borderRadius: "7px",
        fontFamily: tokens.fontBody,
        fontSize: "0.78rem",
        fontWeight: 600,
        color: "#FF5E5B",
        bgcolor: alpha("#FF5E5B", 0.1),
        border: `1px solid ${alpha("#FF5E5B", 0.25)}`,
        transition: "background 0.15s, border-color 0.15s",
        "&:hover": {
          bgcolor: alpha("#FF5E5B", 0.18),
          borderColor: alpha("#FF5E5B", 0.5),
        },
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
      </svg>
      Support
    </Link>
  );
}

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
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);

  // Breakpoint tiers
  const isXL = useMediaQuery("(min-width:1300px)");     // full individual buttons
  const isLarge = useMediaQuery("(min-width:1000px)");  // clear all + support + share + combo add
  const isMedium = useMediaQuery("(min-width:780px)");  // clear all + share + combo add

  const closeMenu = () => setMenuAnchor(null);
  const closeAddMenu = () => setAddMenuAnchor(null);

  const menuAction = (fn: () => void) => () => {
    fn();
    closeMenu();
  };

  // ── Combo-add dropdown button ──────────────────────────────────────────────
  const ComboAddButton = (
    <>
      <Box
        component="button"
        onClick={(e: React.MouseEvent<HTMLElement>) => setAddMenuAnchor(e.currentTarget)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          px: "14px",
          py: "6px",
          borderRadius: "7px",
          fontFamily: tokens.fontBody,
          fontSize: "0.78rem",
          fontWeight: 600,
          cursor: "pointer",
          transition: "background 0.15s",
          bgcolor: tokens.green,
          border: "1px solid transparent",
          color: tokens.white,
          "&:hover": { bgcolor: tokens.greenText },
        }}
      >
        <AddIcon sx={ICON_SX} />
        Add
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" style={{ marginLeft: 1 }}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Box>

      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={closeAddMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{ paper: { sx: MENU_PAPER_SX } }}
      >
        <MenuItem
          onClick={() => { onAddTraveler(); closeAddMenu(); }}
          sx={MENU_ITEM_SX}
        >
          <AddIcon sx={ICON_SX} />
          Add Traveler
        </MenuItem>
        <MenuItem
          onClick={() => { onAddTrip(); closeAddMenu(); }}
          disabled={travelerCount === 0}
          sx={MENU_ITEM_SX}
        >
          <AddIcon sx={ICON_SX} />
          Add Trip
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <Box component="nav" sx={NAV_SX}>
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <img
          src="/geo-dark.svg"
          alt=""
          width={32}
          height={32}
          style={{ display: "block", flexShrink: 0 }}
        />
        {isMedium && (
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

        {/* XL ≥1300px: clear all · support · share · add traveler · add trip */}
        {isXL && (
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <NavButton
              variant="destructive"
              onClick={onClearAll}
              disabled={travelerCount === 0}
              icon={<DeleteOutlineIcon sx={ICON_SX} />}
            >
              Clear All
            </NavButton>

            <KofiLink />

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

        {/* Large 900–1299px: clear all · support · share · combo add */}
        {isLarge && !isXL && (
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <NavButton
              variant="destructive"
              onClick={onClearAll}
              disabled={travelerCount === 0}
              icon={<DeleteOutlineIcon sx={ICON_SX} />}
            >
              Clear All
            </NavButton>

            <KofiLink />

            <NavButton
              variant="ghost"
              onClick={onShare}
              icon={<IosShareIcon sx={ICON_SX} />}
            >
              Share
            </NavButton>

            {ComboAddButton}
          </Box>
        )}

        {/* Medium 640–899px: clear all · share · combo add */}
        {isMedium && !isLarge && (
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

            {ComboAddButton}
          </Box>
        )}

        {/* Small <640px: kebab menu with everything */}
        {!isMedium && (
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
              slotProps={{ paper: { sx: MENU_PAPER_SX } }}
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

              <MenuItem
                component="a"
                href="https://ko-fi.com/ericluskjopson"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                sx={{ ...MENU_ITEM_SX, color: "#FF5E5B", "&:hover": { bgcolor: alpha("#FF5E5B", 0.1), color: "#FF5E5B" } }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
                </svg>
                Support this project
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
