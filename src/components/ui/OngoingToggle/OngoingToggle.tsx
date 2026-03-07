import Box from "@mui/material/Box";
import { tokens } from "@/styles/theme";

interface OngoingToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  sx?: object;
}

/**
 * Checkbox-style toggle for marking a trip as ongoing (no exit date yet).
 * Matches the `.ongoing-row` visual from the playground.
 */
export function OngoingToggle({
  checked,
  onChange,
  label = "Currently inside Schengen (no exit yet)",
  sx = {},
}: OngoingToggleProps) {
  return (
    <Box
      component="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        py: "9px",
        px: "11px",
        border: "1.5px solid",
        borderRadius: "8px",
        cursor: "pointer",
        fontFamily: tokens.fontBody,
        fontSize: "0.83rem",
        fontWeight: 500,
        transition: "all 0.14s",
        userSelect: "none",
        width: "100%",
        // Default
        bgcolor: tokens.mist,
        borderColor: tokens.border,
        color: tokens.textSoft,
        // Checked
        ...(checked && {
          bgcolor: tokens.greenBg,
          borderColor: tokens.greenBorder,
          color: tokens.greenText,
        }),
        ...sx,
      }}
    >
      {/* Check indicator */}
      <Box
        component="span"
        aria-hidden
        sx={{
          width: 15,
          height: 15,
          border: "2px solid",
          borderRadius: "3px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "0.6rem",
          transition: "all 0.14s",
          // Default
          borderColor: tokens.border,
          color: "transparent",
          // Checked
          ...(checked && {
            bgcolor: tokens.green,
            borderColor: tokens.green,
            color: "#fff",
          }),
        }}
      >
        ✓
      </Box>
      {label}
    </Box>
  );
}
