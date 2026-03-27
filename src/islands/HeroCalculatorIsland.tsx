import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/styles/theme";
import { HeroCalculatorCard } from "@/components/HeroCalculatorCard";

/**
 * Astro island wrapper for the HeroCalculatorCard.
 *
 * Provides MUI ThemeProvider + CssBaseline so that Emotion-based styles
 * resolve correctly in the client bundle. Used with `client:visible` so
 * the React runtime is only loaded once the hero enters the viewport.
 */
export function HeroCalculatorIsland() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HeroCalculatorCard />
    </ThemeProvider>
  );
}
