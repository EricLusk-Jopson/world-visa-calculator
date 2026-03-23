import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/styles/theme";
import { CalculatorPage } from "@/pages/CalculatorPage";

/**
 * Astro island wrapper for the calculator page.
 *
 * Used with `client:load` in src/pages/app.astro so the full React app
 * hydrates immediately. Provides the MUI ThemeProvider that was previously
 * supplied by src/app/App.tsx in the Vite SPA.
 *
 * The CalculatorPage component and all its dependencies are left untouched;
 * this file is the sole Astro-layer addition for /app.
 */
export function CalculatorIsland() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CalculatorPage />
    </ThemeProvider>
  );
}
