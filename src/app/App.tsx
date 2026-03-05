import { RouterProvider } from "react-router";
// import { ThemeProvider } from "@mui/material/styles";
import { router } from "./router";

export default function App() {
  return (
    // <ThemeProvider theme={}>
    <RouterProvider router={router} />
    // </ThemeProvider>
  );
}
