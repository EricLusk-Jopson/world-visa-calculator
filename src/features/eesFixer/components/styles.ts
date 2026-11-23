import { tokens } from "@/styles/theme";

/** A native input styled to match. Native date inputs give phones their own picker. */
export const inputSx = {
  width: "100%",
  minHeight: 42,
  px: "12px",
  border: `1px solid ${tokens.border}`,
  borderRadius: "8px",
  bgcolor: tokens.white,
  fontFamily: tokens.fontBody,
  fontSize: "0.92rem",
  color: tokens.text,
  boxSizing: "border-box" as const,
  "&:focus": { outline: `2px solid ${tokens.green}`, outlineOffset: "1px", borderColor: tokens.green },
};
