import { tokens } from "@/styles/theme";
import { Box } from "@mui/material";

export function AddTripButton({
  onClick,
  mt,
}: {
  onClick: () => void;
  mt?: string | number;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        border: `1.5px dashed ${tokens.border}`,
        borderRadius: "8px",
        height: 40,
        minHeight: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        cursor: "pointer",
        color: tokens.textSoft,
        fontFamily: tokens.fontBody,
        fontSize: "0.78rem",
        fontWeight: 600,
        bgcolor: tokens.white,
        mt,
        transition: "all 0.15s",
        "&:hover": {
          borderColor: tokens.navy,
          color: tokens.navy,
          bgcolor: tokens.mist,
        },
      }}
    >
      <Box component="span" sx={{ fontSize: "1rem", lineHeight: 1 }}>
        +
      </Box>
      Add trip
    </Box>
  );
}
