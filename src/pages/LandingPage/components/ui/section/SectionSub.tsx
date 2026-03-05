import { tokens } from "@/styles/theme";
import { Typography } from "@mui/material";

export function SectionSub({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <Typography
      sx={{
        fontFamily: tokens.fontBody,
        fontSize: "1rem",
        color: light ? "rgba(255,255,255,0.6)" : tokens.textSoft,
        lineHeight: 1.7,
        maxWidth: 520,
      }}
    >
      {children}
    </Typography>
  );
}
