import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";

export type CalcView = "timeline" | "cards";

interface CalculatorNavProps {
  view: CalcView;
  onViewChange: (v: CalcView) => void;
  onAddTraveler: () => void;
  onCopyLink: () => void;
}

export function CalculatorNav({
  view,
  onViewChange,
  onAddTraveler,
  onCopyLink,
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
        {/* Copy link */}
        <Box
          component="button"
          onClick={onCopyLink}
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
            },
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path
              d="M4 5.5a2 2 0 0 0 3 0L8.5 4A2.12 2.12 0 0 0 5.5 1L4.5 2"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M7 5.5a2 2 0 0 0-3 0L2.5 7A2.12 2.12 0 0 0 5.5 10L6.5 9"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          Copy link
        </Box>

        {/* Add Traveler CTA */}
        <Box
          component="button"
          onClick={onAddTraveler}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            px: "14px",
            py: "6px",
            bgcolor: tokens.green,
            border: "none",
            borderRadius: "7px",
            fontFamily: tokens.fontBody,
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#fff",
            cursor: "pointer",
            transition: "background 0.15s",
            "&:hover": { bgcolor: "#00A05C" },
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
      </Box>
    </Box>
  );
}
