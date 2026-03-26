import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/styles/theme";
import LandingPage from "@/pages/LandingPage";

/**
 * Astro island wrapper for the landing page.
 *
 * Used with `client:only="react"` in astro/pages/index.astro because MUI's
 * Emotion-based styling requires the client-side runtime to inject CSS rules.
 * Without `client:only`, Astro would SSR the component to plain HTML but
 * Emotion would not produce the corresponding <style> tags (that requires
 * @emotion/server SSR extraction — a future enhancement).
 *
 * All landing-page React source files are left untouched; this file is the
 * sole Astro-layer addition.
 */
export function LandingPageIsland() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LandingPage />
    </ThemeProvider>
  );
}
