import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  integrations: [react()],
  output: "static",
  // Point Astro's source directory at astro/ so it only scans that tree for
  // pages, layouts, and components. The React source tree (src/) is entirely
  // untouched and imported by island wrappers via the @ alias.
  srcDir: "./astro",
  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  },
});
