import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Import the library from source so changes show up instantly
      "@omriattiya/react-cursor": fileURLToPath(new URL("../src/index.ts", import.meta.url)),
    },
  },
});
