import Box from "@mui/material/Box";
import { keyframes } from "@mui/system";
import { tokens } from "@/styles/theme";

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.45; transform: scale(0.72); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export function LoadingScreen() {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: tokens.offWhite,
        animation: `${fadeIn} 0.18s ease-out both`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Logo lockup */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
          }}
        >
          {/* Animated green dot */}
          <Box
            sx={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              bgcolor: tokens.green,
              animation: `${pulse} 1.4s ease-in-out infinite`,
            }}
          />
          <Box
            component="span"
            sx={{
              fontFamily: tokens.fontDisplay,
              fontSize: "1.15rem",
              fontStyle: "italic",
              fontWeight: 500,
              color: tokens.navy,
              letterSpacing: "-0.01em",
            }}
          >
            EuroVisaCalculator
          </Box>
        </Box>

        {/* Thin indeterminate track */}
        <Box
          sx={{
            width: 140,
            height: 2,
            borderRadius: "100px",
            bgcolor: tokens.border,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "40%",
              borderRadius: "100px",
              bgcolor: tokens.green,
              animation: `slide 1.1s ease-in-out infinite`,
              "@keyframes slide": {
                "0%": { left: "-40%" },
                "100%": { left: "100%" },
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
