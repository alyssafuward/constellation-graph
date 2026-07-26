import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // deployed as a GitHub Pages project site, served at /constellation-graph/
  base: "/constellation-graph/",
});
