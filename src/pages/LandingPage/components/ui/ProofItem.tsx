import { tokens } from "@/styles/theme";
import { Box } from "@mui/material";

export function ProofItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontFamily: tokens.fontBody,
        fontSize: "0.82rem",
        color: tokens.textSoft,
        fontWeight: 500,
      }}
    >
      <Box sx={{ color: tokens.green, flexShrink: 0, display: "flex" }}>
        {icon}
      </Box>
      {children}
    </Box>
  );
}
