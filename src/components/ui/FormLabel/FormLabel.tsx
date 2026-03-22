import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { tokens } from "@/styles/theme";

interface FormLabelProps {
  children: ReactNode;
  htmlFor?: string;
}

/**
 * Uppercase label used above form fields in modals.
 * Mirrors the MuiInputLabel override in theme.ts but works with custom inputs.
 */
export function FormLabel({ children, htmlFor }: FormLabelProps) {
  return (
    <Typography
      component="label"
      htmlFor={htmlFor}
      sx={{
        display: "block",
        fontFamily: tokens.fontBody,
        fontSize: "0.68rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: tokens.textSoft,
        mb: "5px",
      }}
    >
      {children}
    </Typography>
  );
}
