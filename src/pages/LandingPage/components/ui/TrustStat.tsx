import { tokens } from "@/styles/theme";
import { Box, Typography } from "@mui/material";

export function TrustStat({
  num,
  label,
  light = false,
}: {
  num: string;
  label: React.ReactNode;
  light?: boolean;
}) {
  console.log(light);
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography
        sx={{
          fontFamily: tokens.fontDisplay,
          fontSize: "2.4rem",
          fontWeight: 600,
          color: light ? tokens.navy : tokens.green,
          lineHeight: 1,
          mb: "8px",
        }}
      >
        {num}
      </Typography>
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.8rem",
          color: light ? tokens.textSoft : tokens.textGhost,
          lineHeight: 1.5,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
