/**
 * Small presentational pieces shared by the fixer's steps.
 */
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";

export function StepTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <Box sx={{ mb: "18px" }}>
      <Typography
        component="h3"
        sx={{
          fontFamily: tokens.fontDisplay,
          fontSize: { xs: "1.2rem", sm: "1.35rem" },
          fontWeight: 600,
          color: tokens.navy,
          lineHeight: 1.25,
          m: 0,
        }}
      >
        {children}
      </Typography>
      {sub && (
        <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.9rem", color: tokens.textSoft, mt: "6px", lineHeight: 1.5, "& a": { color: tokens.navy, fontWeight: 600 } }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

export type Tone = "info" | "good" | "warn" | "bad";

const TONE: Record<Tone, { bg: string; border: string; text: string }> = {
  info: { bg: tokens.mist, border: tokens.border, text: tokens.text },
  good: { bg: tokens.greenBg, border: tokens.greenBorder, text: tokens.greenText },
  warn: { bg: tokens.amberBg, border: tokens.amberBorder, text: tokens.amberText },
  bad: { bg: tokens.redBg, border: tokens.redBorder, text: tokens.redText },
};

export function Callout({ tone = "info", title, children }: { tone?: Tone; title?: ReactNode; children?: ReactNode }) {
  const t = TONE[tone];
  return (
    <Box
      role={tone === "bad" || tone === "warn" ? "status" : undefined}
      sx={{
        bgcolor: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: "10px",
        px: "14px",
        py: "12px",
        fontFamily: tokens.fontBody,
        fontSize: "0.86rem",
        lineHeight: 1.5,
        color: tokens.text,
        "& a": { color: tokens.navy, fontWeight: 600 },
      }}
    >
      {title && <Box sx={{ fontWeight: 700, color: t.text, mb: children ? "4px" : 0 }}>{title}</Box>}
      {children}
    </Box>
  );
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  disabled,
  href,
  download,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  href?: string;
  download?: string;
  type?: "button" | "submit";
}) {
  const styles = {
    primary: { bgcolor: tokens.navy, color: tokens.white, border: `1px solid ${tokens.navy}`, hover: tokens.navyMid },
    secondary: { bgcolor: tokens.white, color: tokens.navy, border: `1px solid ${tokens.border}`, hover: tokens.mist },
    ghost: { bgcolor: "transparent", color: tokens.textSoft, border: "1px solid transparent", hover: tokens.mist },
    danger: { bgcolor: "transparent", color: tokens.redText, border: `1px solid ${tokens.redBorder}`, hover: tokens.redBg },
  }[variant];
  return (
    <Box
      component={href ? "a" : "button"}
      type={href ? undefined : type}
      href={href}
      download={download}
      onClick={disabled ? undefined : onClick}
      disabled={href ? undefined : disabled}
      aria-disabled={disabled || undefined}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        minHeight: 42,
        px: "18px",
        borderRadius: "10px",
        fontFamily: tokens.fontBody,
        fontSize: "0.9rem",
        fontWeight: 700,
        textDecoration: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background-color 0.12s",
        bgcolor: styles.bgcolor,
        color: styles.color,
        border: styles.border,
        "&:hover": disabled ? undefined : { bgcolor: styles.hover },
        "&:focus-visible": { outline: `2px solid ${tokens.green}`, outlineOffset: "2px" },
      }}
    >
      {children}
    </Box>
  );
}

export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <Box
      component="label"
      htmlFor={htmlFor}
      sx={{ display: "block", fontFamily: tokens.fontBody, fontSize: "0.78rem", fontWeight: 700, color: tokens.textSoft, mb: "4px" }}
    >
      {children}
    </Box>
  );
}
