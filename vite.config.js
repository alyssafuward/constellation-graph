import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // deployed at constellation.thehartstudio.live/pangram-reaction, so asset URLs
  // need to resolve relative to that subfolder rather than the domain root
  base: "/pangram-reaction/",
});
