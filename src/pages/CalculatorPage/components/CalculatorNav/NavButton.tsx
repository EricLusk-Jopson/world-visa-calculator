import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import { tokens } from "@/styles/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavButtonVariant = "ghost" | "cta" | "destructive";

interface NavButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: NavButtonVariant;
  icon?: React.ReactNode;
  disabled?: boolean;
}

// ─── Variant styles ───────────────────────────────────────────────────────────

const GHOST_STYLES = {
  bgcolor: alpha(tokens.white, 0.08),
  border: `1px solid ${alpha(tokens.white, 0.12)}`,
  color: alpha(tokens.white, 0.65),
  "&:hover:not(:disabled)": {
    bgcolor: alpha(tokens.white, 0.14),
    borderColor: alpha(tokens.white, 0.28),
    color: tokens.white,
  },
} as const;

const CTA_STYLES = {
  bgcolor: tokens.green,
  border: "1px solid transparent",
  color: tokens.white,
  "&:hover:not(:disabled)": {
    bgcolor: tokens.greenText, // darkened green, closest token
    borderColor: "transparent",
    color: tokens.white,
  },
} as const;

const DESTRUCTIVE_STYLES = {
  bgcolor: "transparent",
  border: "1px solid transparent",
  color: alpha(tokens.white, 0.3),
  "&:hover:not(:disabled)": {
    bgcolor: alpha(tokens.red, 0.12),
    borderColor: alpha(tokens.red, 0.3),
    color: tokens.red,
  },
} as const;

const DISABLED_STYLES = {
  bgcolor: alpha(tokens.white, 0.05),
  border: "1px solid transparent",
  color: alpha(tokens.white, 0.2),
  cursor: "not-allowed",
  "&:hover": {
    bgcolor: alpha(tokens.white, 0.05),
    borderColor: "transparent",
    color: alpha(tokens.white, 0.2),
  },
} as const;

const VARIANT_MAP: Record<NavButtonVariant, object> = {
  ghost: GHOST_STYLES,
  cta: CTA_STYLES,
  destructive: DESTRUCTIVE_STYLES,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function NavButton({
  onClick,
  children,
  variant = "ghost",
  icon,
  disabled = false,
}: NavButtonProps) {
  return (
    <Box
      component="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        px: "14px",
        py: "6px",
        borderRadius: "7px",
        fontFamily: tokens.fontBody,
        fontSize: "0.78rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s, color 0.15s",
        ...(disabled ? DISABLED_STYLES : VARIANT_MAP[variant]),
      }}
    >
      {icon}
      {children}
    </Box>
  );
}
