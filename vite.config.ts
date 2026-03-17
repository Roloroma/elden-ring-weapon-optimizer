// https://vitejs.dev/config/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import eslint from "vite-plugin-eslint";

export default defineConfig({
  // For GitHub Pages deployments under a subpath, set BASE_PATH (e.g. "/elden-ring-weapon-optimizer/")
  // in the build environment.
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), eslint()],
  build: {
    outDir: "build",
  },
});
