import { RouterProvider } from "react-router";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { router } from "./router";
import theme from "../styles/theme";

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
