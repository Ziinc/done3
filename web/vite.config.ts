/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    clearMocks: true,
    setupFiles: ["test/helpers/setup.ts", "global-jsdom/register"],
    coverage: {
      provider: 'c8' // or 'c8'
    },
  },
  build: {
    outDir: "dist/app"
  }
});
