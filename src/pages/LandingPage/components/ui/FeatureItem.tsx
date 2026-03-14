import { tokens } from "@/styles/theme";
import { Box, alpha, Typography } from "@mui/material";

export function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Box sx={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          bgcolor: alpha(tokens.green, 0.12),
          border: `1px solid ${alpha(tokens.green, 0.2)}`,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.green,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "1rem",
            fontWeight: 400,
            fontStyle: "italic",
            color: tokens.white,
            mb: "4px",
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.6,
          }}
        >
          {desc}
        </Typography>
      </Box>
    </Box>
  );
}
