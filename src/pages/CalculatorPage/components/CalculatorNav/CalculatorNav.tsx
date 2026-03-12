import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";

export type CalcView = "timeline" | "cards";

interface CalculatorNavProps {
  view: CalcView;
  onViewChange: (v: CalcView) => void;
  onAddTraveler: () => void;
  onAddTrip: () => void;
  travelerCount: number;
  onShare: () => void;
}

export function CalculatorNav({
  view,
  onViewChange,
  onAddTraveler,
  onAddTrip,
  travelerCount,
  onShare,
}: CalculatorNavProps) {
  return (
    <Box
      component="nav"
      sx={{
        height: 54,
        bgcolor: tokens.navy,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: "20px",
        flexShrink: 0,
        zIndex: 10,
        boxShadow: "0 2px 12px rgba(12,30,60,0.18)",
      }}
    >
      {/* Logo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <Box
          sx={{
            width: 7,
            height: 7,
            bgcolor: tokens.green,
            borderRadius: "50%",
          }}
        />
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#fff",
            letterSpacing: "-0.01em",
          }}
        >
          EuroVisaCalculator
        </Typography>
      </Box>

      {/* View toggle */}
      <Box
        sx={{
          display: "flex",
          bgcolor: "rgba(255,255,255,0.08)",
          borderRadius: "7px",
          p: "3px",
          gap: "2px",
        }}
      >
        {(["timeline", "cards"] as const).map((v) => (
          <Box
            key={v}
            component="button"
            onClick={() => onViewChange(v)}
            sx={{
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
              bgcolor: view === v ? "rgba(255,255,255,0.14)" : "transparent",
              color: view === v ? "#fff" : "rgba(255,255,255,0.4)",
              "&:hover": {
                bgcolor:
                  view === v
                    ? "rgba(255,255,255,0.14)"
                    : "rgba(255,255,255,0.07)",
                color: "#fff",
              },
            }}
          >
            {v}
          </Box>
        ))}
      </Box>

      {/* Right actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Share */}
        <Box
          component="button"
          onClick={onShare}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            px: "12px",
            py: "6px",
            bgcolor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "7px",
            fontFamily: tokens.fontBody,
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "rgba(255,255,255,0.55)",
            cursor: "pointer",
            transition: "all 0.15s",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.14)",
              color: "#fff",
              borderColor: "rgba(255,255,255,0.22)",
            },
          }}
        >
          {/* Share / upload icon */}
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
          Share
        </Box>

        {/* Add Traveler */}
        <Box
          component="button"
          onClick={onAddTraveler}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            px: "14px",
            py: "6px",
            bgcolor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "7px",
            fontFamily: tokens.fontBody,
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            transition: "all 0.15s",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.14)",
              color: "#fff",
            },
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path
              d="M5.5 1v9M1 5.5h9"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          Add Traveler
        </Box>

        {/* Add Trip */}
        <Box
          component="button"
          onClick={onAddTrip}
          disabled={travelerCount === 0}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            px: "14px",
            py: "6px",
            bgcolor:
              travelerCount === 0 ? "rgba(255,255,255,0.06)" : tokens.green,
            border: "none",
            borderRadius: "7px",
            fontFamily: tokens.fontBody,
            fontSize: "0.78rem",
            fontWeight: 600,
            color: travelerCount === 0 ? "rgba(255,255,255,0.2)" : "#fff",
            cursor: travelerCount === 0 ? "not-allowed" : "pointer",
            transition: "background 0.15s, color 0.15s",
            "&:hover": travelerCount === 0 ? {} : { bgcolor: "#00A05C" },
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path
              d="M5.5 1v9M1 5.5h9"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          Add Trip
        </Box>
      </Box>
    </Box>
  );
}
