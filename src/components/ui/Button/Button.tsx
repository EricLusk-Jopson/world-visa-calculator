import MuiButton from "@mui/material/Button";
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import type { ReactNode } from "react";
import { tokens } from "@/styles/theme";

export type ButtonVariant =
  | "primary"
  | "green"
  | "ghost"
  | "outline"
  | "danger"
  | "dashed";
export type ButtonSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<ButtonSize, MuiButtonProps["size"]> = {
  sm: "small",
  md: "medium",
  lg: "large",
};

/*
 * Variant → MUI sx overrides.
 * We use sx rather than custom MUI variants to keep the theme lean
 * and make per-variant styles readable in one place.
 */
const VARIANT_SX: Record<ButtonVariant, object> = {
  primary: {
    bgcolor: tokens.navy,
    color: "#fff",
    "&:hover:not(:disabled)": {
      bgcolor: tokens.navyMid,
      transform: "translateY(-1px)",
      boxShadow: "0 4px 14px rgba(12,30,60,0.18)",
    },
  },

  green: {
    bgcolor: tokens.green,
    color: "#fff",
    "&:hover:not(:disabled)": {
      bgcolor: "#00A05C",
      transform: "translateY(-1px)",
      boxShadow: "0 6px 20px rgba(0,185,107,0.30)",
    },
  },

  ghost: {
    bgcolor: tokens.mist,
    color: tokens.textSoft,
    "&:hover:not(:disabled)": {
      bgcolor: tokens.border,
      color: tokens.text,
    },
  },

  outline: {
    bgcolor: "transparent",
    color: tokens.textSoft,
    border: `1.5px solid ${tokens.border}`,
    "&:hover:not(:disabled)": {
      border: `1.5px solid ${tokens.navy}`,
      bgcolor: "transparent",
      color: tokens.navy,
    },
  },

  danger: {
    bgcolor: tokens.redBg,
    color: tokens.redText,
    border: `1px solid ${tokens.redBorder}`,
    "&:hover:not(:disabled)": {
      bgcolor: tokens.red,
      color: "#fff",
      border: `1px solid ${tokens.red}`,
    },
  },

  dashed: {
    bgcolor: tokens.white,
    color: tokens.textSoft,
    border: `1.5px dashed ${tokens.border}`,
    "&:hover:not(:disabled)": {
      border: `1.5px dashed ${tokens.navy}`,
      bgcolor: tokens.mist,
      color: tokens.navy,
    },
  },
};

// ── Component ────────────────────────────────────────────────────────────────

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /** For link-style buttons */
  component?: React.ElementType;
  href?: string;
  sx?: object;
}

export function Button({
  variant = "primary",
  size = "md",
  sx = {},
  ...props
}: ButtonProps) {
  return (
    <MuiButton
      disableElevation
      size={SIZE_MAP[size]}
      sx={{
        ...VARIANT_SX[variant],
        transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        "&:disabled": { opacity: 0.45 },
        ...sx,
      }}
      {...props}
    />
  );
}
