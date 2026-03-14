import { tokens } from "@/styles/theme";
import { Box } from "@mui/material";

export function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: tokens.fontBody,
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: tokens.green,
        mb: 2,
      }}
    >
      <Box
        component="span"
        sx={{
          width: 7,
          height: 7,
          bgcolor: tokens.green,
          borderRadius: "50%",
          flexShrink: 0,
        }}
      />
      {children}
    </Box>
  );
}
