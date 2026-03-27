import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { router } from "./router";
import theme from "../styles/theme";
import { trackEvent } from "@/utils/analytics";

export default function App() {
  useEffect(() => {
    trackEvent("session_start", {
      source: new URLSearchParams(window.location.search).get("ref") ?? "direct",
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
