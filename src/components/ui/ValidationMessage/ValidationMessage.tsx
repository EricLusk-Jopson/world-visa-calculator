import Alert from "@mui/material/Alert";
import { tokens } from "@/styles/theme";
import type { ReactNode } from "react";

export type ValidationVariant = "info" | "success" | "warning" | "error";

/*
 * MUI Alert uses severity to set colour. We restyle it to match the EVC
 * design tokens exactly rather than using MUI's default palette mapping.
 */
const VARIANT_SX: Record<ValidationVariant, object> = {
  info: {
    bgcolor: tokens.mist,
    color: tokens.textSoft,
    border: `1px solid ${tokens.border}`,
    "& .MuiAlert-icon": { color: tokens.textSoft },
  },
  success: {
    bgcolor: tokens.greenBg,
    color: tokens.greenText,
    border: `1px solid ${tokens.greenBorder}`,
    "& .MuiAlert-icon": { color: tokens.green },
  },
  warning: {
    bgcolor: tokens.amberBg,
    color: tokens.amberText,
    border: `1px solid ${tokens.amberBorder}`,
    "& .MuiAlert-icon": { color: tokens.amber },
  },
  error: {
    bgcolor: tokens.redBg,
    color: tokens.redText,
    border: `1px solid ${tokens.redBorder}`,
    "& .MuiAlert-icon": { color: tokens.red },
  },
};

const SEVERITY_MAP: Record<
  ValidationVariant,
  "info" | "success" | "warning" | "error"
> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
};

interface ValidationMessageProps {
  variant: ValidationVariant;
  children: ReactNode;
  sx?: object;
}

export function ValidationMessage({
  variant,
  children,
  sx = {},
}: ValidationMessageProps) {
  return (
    <Alert
      severity={SEVERITY_MAP[variant]}
      sx={{
        py: "9px",
        px: "12px",
        borderRadius: "10px",
        fontFamily: tokens.fontBody,
        fontSize: "0.8rem",
        fontWeight: 500,
        lineHeight: 1.5,
        alignItems: "flex-start",
        "& .MuiAlert-icon": {
          pt: "1px",
          fontSize: "0.85rem",
        },
        "& .MuiAlert-message": {
          p: 0,
        },
        ...VARIANT_SX[variant],
        ...sx,
      }}
    >
      {children}
    </Alert>
  );
}
