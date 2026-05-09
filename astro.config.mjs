import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { fileURLToPath } from "url";
import path from "path";

import sitemap from "@astrojs/sitemap";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: "https://www.eurovisacalculator.com",
  integrations: [
    react(),
    sitemap({
      filter: (page) => page !== "https://www.eurovisacalculator.com/app/",
    }),
  ],
  output: "static",
  srcDir: "./astro",
  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  },
});
