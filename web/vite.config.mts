/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    clearMocks: true,
    setupFiles: ["test/helpers/setup.ts"],
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: id => {
          if (id.includes("tiptap") || id.includes("dompurify") || id.includes("marked")) {
            return "editor";
          } else if (id.includes("x-date-pickers" )) {
            return "ux"
          }
        }, 
      },
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        warn(warning);
      },
    },
  },
});
