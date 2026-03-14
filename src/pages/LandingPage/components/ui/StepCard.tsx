import { tokens } from "@/styles/theme";
import { Box, Typography } from "@mui/material";

export function StepCard({
  num,
  icon,
  title,
  desc,
  borderLeft = false,
}: {
  num: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  borderLeft?: boolean;
}) {
  return (
    <Box
      sx={{
        bgcolor: tokens.white,
        p: "40px 36px",
        borderLeft: borderLeft ? `1px solid ${tokens.border}` : "none",
        transition: "background 0.2s",
        "&:hover": { bgcolor: "#FAFBFD" },
      }}
    >
      <Typography
        sx={{
          fontFamily: tokens.fontDisplay,
          fontSize: "3.5rem",
          fontWeight: 300,
          fontStyle: "italic",
          color: tokens.textSoft,
          lineHeight: 1,
          mb: 2,
        }}
      >
        {num}
      </Typography>
      <Box
        sx={{
          width: 44,
          height: 44,
          bgcolor: tokens.greenBg,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.green,
          mb: "20px",
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontFamily: tokens.fontDisplay,
          fontSize: "1.25rem",
          fontWeight: 400,
          fontStyle: "italic",
          color: tokens.navy,
          mb: "10px",
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.875rem",
          color: tokens.textSoft,
          lineHeight: 1.7,
        }}
      >
        {desc}
      </Typography>
    </Box>
  );
}
