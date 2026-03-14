import { tokens } from "@/styles/theme";
import { Box } from "@mui/material";

export function RulePill({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        fontFamily: tokens.fontBody,
        fontSize: "0.68rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        px: "10px",
        py: "4px",
        borderRadius: "100px",
        bgcolor: tokens.mist,
        color: tokens.textSoft,
      }}
    >
      {children}
    </Box>
  );
}
