import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path
      d="M5.5 1v9M1 5.5h9"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const ShareIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path
      d="M5.5 1v6.5M3 3.5L5.5 1 8 3.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 7.5v1.75C2 9.66 2.34 10 2.75 10h5.5C8.66 10 9 9.66 9 9.25V7.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

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
  boxShadow: "0 2px 12px rgba(12,30,60,0.18)",
} as const;

const LOGO_DOT_SX = {
  width: 7,
  height: 7,
  bgcolor: tokens.green,
  borderRadius: "50%",
} as const;

const LOGO_TEXT_SX = {
  fontFamily: tokens.fontDisplay,
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "#fff",
  letterSpacing: "-0.01em",
} as const;

const VIEW_TOGGLE_WRAPPER_SX = {
  display: "flex",
  bgcolor: "rgba(255,255,255,0.08)",
  borderRadius: "7px",
  p: "3px",
  gap: "2px",
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
    bgcolor: active ? "rgba(255,255,255,0.14)" : "transparent",
    color: active ? "#fff" : "rgba(255,255,255,0.4)",
    "&:hover": {
      bgcolor: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.07)",
      color: "#fff",
    },
  }) as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function CalculatorNav({
  view,
  onViewChange,
  onAddTraveler,
  onAddTrip,
  travelerCount,
  onShare,
}: CalculatorNavProps) {
  return (
    <Box component="nav" sx={NAV_SX}>
      {/* Logo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <Box sx={LOGO_DOT_SX} />
        <Typography sx={LOGO_TEXT_SX}>EuroVisaCalculator</Typography>
      </Box>

      {/* View toggle */}
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

      {/* Right actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <NavButton variant="ghost" onClick={onShare} icon={<ShareIcon />}>
          Share
        </NavButton>

        <NavButton variant="ghost" onClick={onAddTraveler} icon={<PlusIcon />}>
          Add Traveler
        </NavButton>

        <NavButton
          variant="cta"
          onClick={onAddTrip}
          icon={<PlusIcon />}
          disabled={travelerCount === 0}
        >
          Add Trip
        </NavButton>
      </Box>
    </Box>
  );
}
