import { tokens } from "@/styles/theme";
import { Typography } from "@mui/material";

export function SectionHeading({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <Typography
      variant="h2"
      sx={{
        fontFamily: tokens.fontDisplay,
        fontSize: "clamp(2rem, 3vw, 2.8rem)",
        fontWeight: 400,
        color: light ? tokens.white : tokens.navy,
        lineHeight: 1.2,
        mb: 2,
        letterSpacing: "-0.01em",
        "& em": { fontStyle: "italic", color: tokens.green },
      }}
    >
      {children}
    </Typography>
  );
}
