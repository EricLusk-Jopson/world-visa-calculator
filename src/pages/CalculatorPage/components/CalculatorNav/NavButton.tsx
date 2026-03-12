import Box from "@mui/material/Box";
import { tokens } from "@/styles/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavButtonVariant = "ghost" | "cta";

interface NavButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: NavButtonVariant;
  icon?: React.ReactNode;
  disabled?: boolean;
}

// ─── Variant styles ───────────────────────────────────────────────────────────

const GHOST_STYLES = {
  bgcolor: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(255,255,255,0.65)",
  "&:hover:not(:disabled)": {
    bgcolor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.28)",
    color: "#fff",
  },
} as const;

const CTA_STYLES = {
  bgcolor: tokens.green,
  border: "1px solid transparent",
  color: "#fff",
  "&:hover:not(:disabled)": {
    bgcolor: "#00A05C",
    borderColor: "transparent",
    color: "#fff",
  },
} as const;

const DISABLED_STYLES = {
  bgcolor: "rgba(255,255,255,0.05)",
  border: "1px solid transparent",
  color: "rgba(255,255,255,0.2)",
  cursor: "not-allowed",
} as const;

const VARIANT_MAP: Record<NavButtonVariant, object> = {
  ghost: GHOST_STYLES,
  cta: CTA_STYLES,
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
        // Base
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
        // Variant
        ...(disabled ? DISABLED_STYLES : VARIANT_MAP[variant]),
      }}
    >
      {icon}
      {children}
    </Box>
  );
}
